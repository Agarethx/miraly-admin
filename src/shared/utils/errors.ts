/**
 * Error handling helpers. Turns any thrown value into a user-facing message,
 * never leaking raw technical text to the UI.
 */
const NETWORK_HINT = /network|fetch|timeout|offline|connection/i;

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (NETWORK_HINT.test(error.message)) {
      return 'Sin conexión. Revisa tu internet e intenta de nuevo.';
    }
    // Supabase auth errors carry human messages; other Errors are technical.
    return error.message.length < 140 ? error.message : 'Algo salió mal. Intenta de nuevo.';
  }
  return 'Algo salió mal. Intenta de nuevo.';
}
