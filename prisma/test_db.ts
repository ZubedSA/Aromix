import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Mencoba koneksi ke database...');
    const count = await prisma.user.count();
    console.log('Koneksi Berhasil! Jumlah user saat ini:', count);
}

main()
    .catch((e) => {
        console.error('Koneksi Gagal:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
