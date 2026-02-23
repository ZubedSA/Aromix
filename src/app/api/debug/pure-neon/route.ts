import { NextResponse } from 'next/server';
import { Pool } from '@neondatabase/serverless';
import ws from 'ws';

export async function GET() {
    const rawUrl = process.env.DATABASE_URL || '';
    const urlStr = rawUrl.replace(/[^\x21-\x7E]/g, '').trim().replace(/^["']|["']$/g, '');

    try {
        const url = new URL(urlStr);
        const pool = new Pool({
            host: url.hostname,
            user: url.username,
            password: decodeURIComponent(url.password),
            database: url.pathname.substring(1),
            port: parseInt(url.port) || 5432,
            ssl: true,
            connectionTimeoutMillis: 5000,
        });

        const res = await pool.query('SELECT NOW()');
        await pool.end();

        return NextResponse.json({
            success: true,
            now: res.rows[0].now,
            host: url.hostname
        });
    } catch (e: any) {
        return NextResponse.json({
            success: false,
            error: e.message,
            stack: e.stack
        }, { status: 500 });
    }
}
