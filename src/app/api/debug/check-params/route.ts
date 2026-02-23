import { NextResponse } from 'next/server';

export async function GET() {
    const rawUrl = process.env.DATABASE_URL || '';
    const urlStr = rawUrl.replace(/[^\x21-\x7E]/g, '').trim().replace(/^["']|["']$/g, '');

    try {
        const url = new URL(urlStr);
        return NextResponse.json({
            host: url.hostname,
            user: url.username,
            pass_len: url.password.length,
            db: url.pathname.substring(1),
            port: url.port,
            is_neon: url.hostname.includes('neon.tech')
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message });
    }
}
