import { NextResponse } from 'next/server';
import { ringg } from '@/lib/ringg';

export async function GET() {
  const keyRaw = process.env.RINGG_API_KEY ?? '';
  const keyLen = keyRaw.length;
  const firstCharCode = keyRaw.charCodeAt(0);

  try {
    const agents = await ringg.getAssistants();
    return NextResponse.json({ ok: true, keyLen, firstCharCode, agents });
  } catch (err) {
    return NextResponse.json({
      ok: false,
      keyLen,
      firstCharCode,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
