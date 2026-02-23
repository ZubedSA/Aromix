import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'fs';

export async function GET() {
    const db_url = process.env.DATABASE_URL || 'UNDEFINED';

    // Write to a file in the project root to inspect exact bytes
    try {
        fs.writeFileSync('D:\\web\\AROMIX-Sistem\\debug_url_literal.txt', db_url, { encoding: 'utf8' });
    } catch (e) {
        console.error('Failed to write debug file', e);
    }

    return NextResponse.json({
        message: "Debug URL captured to file",
        length: db_url.length,
        defined: db_url !== 'UNDEFINED'
    });
}
