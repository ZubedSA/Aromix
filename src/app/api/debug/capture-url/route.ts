import { NextResponse } from 'next/server';

export async function GET() {
    const db_url = process.env.DATABASE_URL || 'UNDEFINED';

    console.log('[DEBUG]: DATABASE_URL length:', db_url.length, 'defined:', db_url !== 'UNDEFINED');

    return NextResponse.json({
        message: "Debug URL checked",
        length: db_url.length,
        defined: db_url !== 'UNDEFINED'
    });
}
