import { NextResponse } from 'next/server';

export async function GET() {
    const rawUrl = process.env.DATABASE_URL || '';
    const cleaned = rawUrl.replace(/[^\x21-\x7E]/g, '').trim().replace(/^["']|["']$/g, '');

    const raw_codes = [];
    for (let i = 0; i < rawUrl.length; i++) {
        raw_codes.push(rawUrl.charCodeAt(i));
    }

    const cleaned_codes = [];
    for (let i = 0; i < cleaned.length; i++) {
        cleaned_codes.push(cleaned.charCodeAt(i));
    }

    return NextResponse.json({
        raw_length: rawUrl.length,
        raw_codes: raw_codes,
        cleaned_length: cleaned.length,
        cleaned_codes: cleaned_codes,
        is_valid_url: cleaned.startsWith('postgresql://')
    });
}
