import { PrismaClient } from '@prisma/client'
import { neon } from '@neondatabase/serverless'
import { PrismaNeonHTTP } from '@prisma/adapter-neon'

const prismaClientSingleton = () => {
    const connectionString = process.env.DATABASE_URL || ''
    const sql = neon(connectionString)
    const adapter = new PrismaNeonHTTP(sql)
    return new PrismaClient({
        adapter: adapter as any,
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    } as any)
}

declare global {
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

export const prisma = globalThis.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma
