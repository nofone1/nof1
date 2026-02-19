export interface AuthCtx {
  auth: {
    getUserIdentity: () => Promise<{ subject: string } | null>;
  };
}

export async function requireUserId(ctx: AuthCtx): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthorized");
  }
  return identity.subject;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function toIso(value: unknown, fallback = nowIso()): string {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "string") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? fallback : date.toISOString();
  }

  return fallback;
}
