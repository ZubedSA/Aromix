import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// EXPORT ALL DATA
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = {
            stores: await prisma.store.findMany(),
            users: await prisma.user.findMany(),
            subscriptions: await prisma.subscription.findMany(),
            ingredients: await prisma.ingredient.findMany(),
            products: await prisma.product.findMany(),
            formulas: await prisma.formula.findMany(),
            formulaItems: await prisma.formulaItem.findMany(),
            customers: await prisma.customer.findMany(),
            suppliers: await prisma.supplier.findMany(),
            transactions: await prisma.transaction.findMany(),
            transactionItems: await prisma.transactionItem.findMany(),
            exportedAt: new Date().toISOString()
        };

        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// RESTORE DATA
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await req.json();

        await prisma.$transaction(async (tx) => {
            // 1. CLEAR ALL DATA (ORDER MATTERS)
            await tx.transactionItem.deleteMany();
            await tx.transaction.deleteMany();
            await tx.formulaItem.deleteMany();
            await tx.formula.deleteMany();
            await tx.product.deleteMany();
            await tx.ingredient.deleteMany();
            await tx.subscription.deleteMany();
            await tx.customer.deleteMany();
            await tx.supplier.deleteMany();
            await tx.user.deleteMany();
            await tx.store.deleteMany();

            // 2. RESTORE DATA (ORDER MATTERS)
            if (data.stores?.length) await tx.store.createMany({ data: data.stores });
            if (data.users?.length) await tx.user.createMany({ data: data.users });
            if (data.subscriptions?.length) await tx.subscription.createMany({ data: data.subscriptions });
            if (data.ingredients?.length) await tx.ingredient.createMany({ data: data.ingredients });
            if (data.products?.length) await tx.product.createMany({ data: data.products });
            if (data.formulas?.length) await tx.formula.createMany({ data: data.formulas });
            if (data.formulaItems?.length) await tx.formulaItem.createMany({ data: data.formulaItems });
            if (data.customers?.length) await tx.customer.createMany({ data: data.customers });
            if (data.suppliers?.length) await tx.supplier.createMany({ data: data.suppliers });
            if (data.transactions?.length) await tx.transaction.createMany({ data: data.transactions });
            if (data.transactionItems?.length) await tx.transactionItem.createMany({ data: data.transactionItems });
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Restore Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
