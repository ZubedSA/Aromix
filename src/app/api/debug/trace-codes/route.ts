import { NextResponse } from 'next/server';

export async function GET() {
    const db_url = process.env.DATABASE_URL || '';
    const codes = [];
    for (let i = 0; i < db_url.length; i++) {
        codes.push(db_url.charCodeAt(i));
    }

    return NextResponse.json({
        length: db_url.length,
        codes: codes,
        first10: db_url.substring(0, 10),
        last10: db_url.substring(db_url.length - 10)
    });
}
