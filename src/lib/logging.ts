/** Log operational errors without consumer PII. */
export function logError(code: string, error: unknown): void {
  const message = error instanceof Error ? error.message : "unknown";
  console.error(code, message);
}
