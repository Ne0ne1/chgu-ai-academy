/** Compare program output ignoring a single trailing newline difference. */
export function normalizeStdout(value: string): string {
  return value.replace(/\r\n/g, '\n').replace(/\n+$/u, '');
}

export function valuesEqual(expected: unknown, actual: unknown): boolean {
  if (typeof expected === 'number' && typeof actual === 'number') {
    return Object.is(expected, actual);
  }
  return Object.is(expected, actual);
}
