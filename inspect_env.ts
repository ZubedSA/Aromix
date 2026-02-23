import 'dotenv/config';

const rawUrl = process.env.DATABASE_URL || '';
const codes = [];
for (let i = 0; i < rawUrl.length; i++) {
    codes.push(rawUrl.charCodeAt(i));
}

console.log('--- STANDALONE ENV TEST ---');
console.log('Length:', rawUrl.length);
console.log('Codes:', JSON.stringify(codes));
console.log('First 5:', rawUrl.substring(0, 5));
console.log('Last 5:', rawUrl.substring(rawUrl.length - 5));
process.exit(0);
