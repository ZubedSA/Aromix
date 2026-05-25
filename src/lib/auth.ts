import NextAuth, { NextAuthOptions, DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import fs from 'fs';
import path from 'path';

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: string;
            storeId: string;
            storeName: string;
            subscriptionStatus: string;
            isApproved: boolean;
        } & DefaultSession["user"]
    }

    interface User {
        role: string;
        storeId: string | null;
        storeName: string | null;
        subscriptionStatus: string;
        isApproved: boolean;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role: string;
        storeId: string;
        subscriptionStatus: string;
        isApproved: boolean;
    }
}

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                try {
                    try {
                        const allUsers = await prisma.user.findMany();
                        const output = allUsers.map(u => `ID: ${u.id} | Email: "${u.email}" | Name: "${u.name}" | Role: ${u.role} | Approved: ${u.isApproved} | StoreID: ${u.storeId}`).join('\n');
                        fs.writeFileSync(path.join(process.cwd(), 'diagnostic.txt'), output);
                    } catch (e: any) {
                        fs.writeFileSync(path.join(process.cwd(), 'diagnostic.txt'), 'Diag Error: ' + e.message);
                    }

                    const normalizedEmail = credentials.email.trim().toLowerCase();
                    console.log('[AUTH DEBUG]: Authorizing', normalizedEmail);
                    
                    let user = await prisma.user.findUnique({
                        where: { email: normalizedEmail },
                        include: {
                            store: {
                                include: { subscription: true }
                            }
                        }
                    });

                    if (!user) {
                        user = await prisma.user.findFirst({
                            where: {
                                email: {
                                    equals: normalizedEmail,
                                    mode: 'insensitive'
                                }
                            },
                            include: {
                                store: {
                                    include: { subscription: true }
                                }
                            }
                        });
                    }
 
                    if (!user) {
                        console.log('[AUTH DEBUG]: User not found');
                        throw new Error("Email atau password salah.");
                    }
 
                    const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
                    if (!isPasswordValid) {
                        console.log('[AUTH DEBUG]: Invalid password');
                        throw new Error("Email atau password salah.");
                    }

                    // Auto-approve cashier accounts created by OWNER
                    if (user.role === 'CASHIER' && !user.isApproved) {
                        await prisma.user.update({
                            where: { id: user.id },
                            data: { isApproved: true }
                        });
                        user.isApproved = true;
                        console.log('[AUTH DEBUG]: Cashier auto-approved on login:', user.email);
                    }

                    console.log('[AUTH DEBUG]: Login success for', user.email);
                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        storeId: user.storeId,
                        storeName: user.store?.name || null,
                        subscriptionStatus: user.store?.subscription?.status || 'EXPIRED',
                        isApproved: user.isApproved
                    };
                } catch (error: any) {
                    console.error('[AUTH ERROR]:', error.message);
                    throw error;
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }: any) {
            if (user) {
                token.role = user.role;
                token.storeId = user.storeId;
                token.storeName = user.storeName;
                token.subscriptionStatus = user.subscriptionStatus;
                token.isApproved = user.isApproved;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }: any) {
            if (token) {
                session.user.id = token.id || token.sub;
                session.user.role = token.role;
                session.user.storeId = token.storeId;
                session.user.storeName = token.storeName;
                session.user.subscriptionStatus = token.subscriptionStatus;
                session.user.isApproved = token.isApproved;
            }
            return session;
        }
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
};
