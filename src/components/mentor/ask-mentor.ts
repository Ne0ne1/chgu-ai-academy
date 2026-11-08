'use client';

import type { MentorRequestBody, MentorResponseBody } from '@/lib/mentor/contracts';

export async function askMentor(body: MentorRequestBody): Promise<MentorResponseBody> {
  const response = await fetch('/api/mentor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = (await response.json()) as MentorResponseBody & { error?: string };
  if (!response.ok) {
    throw new Error(data.error || 'Не удалось получить помощь');
  }
  return data;
}
