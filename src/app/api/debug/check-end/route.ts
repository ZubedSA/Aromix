import { NextResponse } from 'next/server';

export async function GET() {
    const db_url = process.env.DATABASE_URL || '';
    const last5 = [];
    for (let i = Math.max(0, db_url.length - 10); i < db_url.length; i++) {
        last5.push(db_url.charCodeAt(i));
    }

    return NextResponse.json({
        length: db_url.length,
        last10_codes: last5,
        last10_chars: db_url.substring(db_url.length - 10)
    });
}
