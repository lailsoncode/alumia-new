export function createSupabaseAuthorizer({ supabaseUrl, supabaseAnonKey, fetchImpl = fetch }) {
  return async function authorize(token) {
    const response = await fetchImpl(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        apikey: supabaseAnonKey,
        authorization: `Bearer ${token}`,
      },
      signal: AbortSignal.timeout(5_000),
    });

    if (!response.ok) return null;
    const user = await response.json();
    return typeof user?.id === "string" ? { id: user.id } : null;
  };
}
