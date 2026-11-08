import { NextResponse } from 'next/server';
import { validateMentorRequest } from '@/lib/mentor/context';
import { isConfiguredModelAvailable } from '@/lib/mentor/ollama';
import { answerMentorRequest } from '@/lib/mentor/service';

export const runtime = 'nodejs';

export async function GET() {
  const availability = await isConfiguredModelAvailable();
  return NextResponse.json({
    available: availability.ok,
    model: availability.model,
    detail: availability.detail,
  });
}

export async function POST(request: Request) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: 'Ожидался JSON' }, { status: 400 });
  }

  const validated = validateMentorRequest(raw);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const answer = await answerMentorRequest(validated.body);
  return NextResponse.json(answer);
}
