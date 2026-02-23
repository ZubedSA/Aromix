import { NextResponse } from 'next/server';

export async function GET() {
    const db_url = process.env.DATABASE_URL || '';
    let result = "";
    for (let i = 0; i < 10; i++) {
        result += db_url.charCodeAt(i) + " ";
    }

    return new NextResponse(result.trim());
}
