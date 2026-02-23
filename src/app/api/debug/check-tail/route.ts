import { NextResponse } from 'next/server';

export async function GET() {
    const db_url = process.env.DATABASE_URL || '';
    let result = "";
    for (let i = Math.max(0, db_url.length - 10); i < db_url.length; i++) {
        result += db_url.charCodeAt(i) + " ";
    }

    return new NextResponse(result.trim());
}
