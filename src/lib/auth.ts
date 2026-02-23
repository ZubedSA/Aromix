import NextAuth, { NextAuthOptions, DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

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
                    const user = await prisma.user.findUnique({
                        where: { email: credentials.email },
                        include: {
                            store: {
                                include: { subscription: true }
                            }
                        }
                    });

                    if (!user) {
                        throw new Error("Email atau password salah.");
                    }

                    const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
                    if (!isPasswordValid) {
                        throw new Error("Email atau password salah.");
                    }

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
            }
            return token;
        },
        async session({ session, token }: any) {
            if (token) {
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
