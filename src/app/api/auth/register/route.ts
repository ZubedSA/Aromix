import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { name, email, password, storeName } = await req.json();

        if (!name || !email || !password || !storeName) {
            return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
        }

        // Check user existence
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // CREATE STORE & USER in a TRANSACTION
        const result = await prisma.$transaction(async (tx) => {
            // 1. Create Store
            const store = await tx.store.create({
                data: {
                    name: storeName,
                }
            });

            // 2. Create Subscription (Default Trial)
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + 14); // 14 days trial

            await tx.subscription.create({
                data: {
                    storeId: store.id,
                    status: 'TRIAL',
                    endDate: endDate,
                }
            });

            // 3. Create User (isApproved = false for new Owners)
            const user = await tx.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    role: 'OWNER' as any,
                    storeId: store.id,
                    isApproved: false,
                }
            });

            return user;
        });

        // --- TELEGRAM NOTIFICATION ---
        try {
            const botToken = process.env.TELEGRAM_BOT_TOKEN;
            const chatId = process.env.TELEGRAM_CHAT_ID;

            if (botToken && chatId) {
                const message = `*📢 PENDAFTARAN MITRA BARU*\n\n🏢 *Brand:* ${storeName}\n👤 *Pemilik:* ${name}\n📧 *Email:* ${email}\n📅 *Waktu:* ${new Date().toLocaleString('id-ID')}\n\nMohon segera review dan aktivasi akun ini di dashboard admin. http:aromix.my.id`;

                await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: chatId,
                        text: message,
                        parse_mode: 'Markdown'
                    })
                });
            }
        } catch (err) {
            console.error("Gagal mengirim notifikasi Telegram:", err);
        }
        // -----------------------------

        return NextResponse.json({ success: true, userId: result.id });
    } catch (error: any) {
        console.error("Registration error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
