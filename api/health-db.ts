import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from './utils/db';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const r = await query('SELECT 1 as ok');
    res.status(200).json({ ok: true, select1: r.rows?.[0] ?? null });
  } catch (e: any) {
    res.status(500).json({
      ok: false,
      code: e?.code ?? null,
      message: e?.message ?? null,
      detail: e?.detail ?? null,
      hint: e?.hint ?? null,
    });
  }
}
