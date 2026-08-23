/**
 * Shared webhook verification helpers.
 *
 * Uses Web Crypto, which is available in the Convex runtime. Kept separate
 * from the route handlers so the comparison logic can be unit tested.
 */

/**
 * Compares two strings without leaking length-independent timing information.
 *
 * Params:
 *   a: First string.
 *   b: Second string.
 *
 * Returns:
 *   True when both strings are identical.
 *
 * Edge cases:
 *   Returns false immediately on a length mismatch, which is unavoidable and
 *   not sensitive: signature lengths are fixed per algorithm.
 */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return mismatch === 0;
}

/**
 * Renders a signature buffer as lowercase hex.
 *
 * Params:
 *   buffer: Raw signature bytes.
 *
 * Returns:
 *   Lowercase hex string.
 */
function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Renders a signature buffer as base64.
 *
 * Params:
 *   buffer: Raw signature bytes.
 *
 * Returns:
 *   Base64 string.
 */
function toBase64(buffer: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Computes an HMAC-SHA256 in both common encodings.
 *
 * Params:
 *   keyBytes: Raw HMAC key material.
 *   payload: Exact string that was signed.
 *
 * Returns:
 *   `{ hex, base64 }` renderings of the same signature.
 *
 * Edge cases:
 *   Providers differ on encoding, so both are produced and either may match.
 */
async function signWith(
  keyBytes: Uint8Array,
  payload: string
): Promise<{ hex: string; base64: string }> {
  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes as unknown as ArrayBuffer,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload)
  );

  return { hex: toHex(signature), base64: toBase64(signature) };
}

/**
 * Computes the HMAC-SHA256 of a payload using a UTF-8 secret.
 *
 * Params:
 *   secret: Shared signing secret.
 *   payload: Exact raw request body as received.
 *
 * Returns:
 *   `{ hex, base64 }` renderings of the same signature.
 */
export async function hmacSha256(
  secret: string,
  payload: string
): Promise<{ hex: string; base64: string }> {
  return signWith(new TextEncoder().encode(secret), payload);
}

/**
 * Verifies a provider signature header against the raw body.
 *
 * Params:
 *   secret: Shared signing secret.
 *   payload: Exact raw request body as received.
 *   header: Signature header value sent by the provider, or null.
 *
 * Returns:
 *   True when the header matches the computed HMAC in hex or base64.
 *
 * Edge cases:
 *   Returns false when the header is missing. Some providers prefix the value
 *   with the scheme (for example "sha256="), which is stripped before
 *   comparison.
 */
export async function verifyHmacSignature(
  secret: string,
  payload: string,
  header: string | null
): Promise<boolean> {
  if (!header) {
    return false;
  }

  const provided = header.trim().replace(/^sha256=/i, "");
  const { hex, base64 } = await hmacSha256(secret, payload);

  return timingSafeEqual(provided, hex) || timingSafeEqual(provided, base64);
}

/** How far a Standard Webhooks timestamp may drift, in milliseconds. */
const STANDARD_WEBHOOK_TOLERANCE_MS = 5 * 60 * 1000;

/**
 * Decodes a base64 string into bytes.
 *
 * Params:
 *   value: Base64 text.
 *
 * Returns:
 *   The decoded bytes, or null when the input is not valid base64.
 */
function tryDecodeBase64(value: string): Uint8Array | null {
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(value) || value.length % 4 !== 0) {
    return null;
  }

  try {
    const binary = atob(value);
    return Uint8Array.from(binary, (character) => character.charCodeAt(0));
  } catch {
    return null;
  }
}

/**
 * Decodes a hex string into bytes.
 *
 * Params:
 *   value: Hex text.
 *
 * Returns:
 *   The decoded bytes, or null when the input is not valid hex.
 */
function tryDecodeHex(value: string): Uint8Array | null {
  if (value.length % 2 !== 0 || !/^[0-9a-fA-F]+$/.test(value)) {
    return null;
  }

  const bytes = new Uint8Array(value.length / 2);
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = Number.parseInt(value.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

/**
 * Produces every plausible HMAC key for a Standard Webhooks secret.
 *
 * Params:
 *   secret: The secret exactly as the provider issued it, prefix included.
 *
 * Returns:
 *   Candidate key byte arrays to try, most specific first.
 *
 * Edge cases:
 *   Providers document only that the key is "derived" from the prefixed
 *   secret, and differ on whether the remainder is raw text, base64, or hex.
 *   Trying each derivation of the same secret costs one HMAC per candidate and
 *   does not weaken verification: every candidate still requires the secret.
 */
function deriveKeyCandidates(secret: string): Uint8Array[] {
  const withoutPrefix = secret.replace(/^(ws|whsec)_/, "");
  const encoder = new TextEncoder();
  const candidates: Uint8Array[] = [encoder.encode(withoutPrefix)];

  const base64Bytes = tryDecodeBase64(withoutPrefix);
  if (base64Bytes) {
    candidates.push(base64Bytes);
  }

  const hexBytes = tryDecodeHex(withoutPrefix);
  if (hexBytes) {
    candidates.push(hexBytes);
  }

  if (withoutPrefix !== secret) {
    candidates.push(encoder.encode(secret));
  }

  return candidates;
}

/** Headers required by the Standard Webhooks signature scheme. */
export interface StandardWebhookHeaders {
  id: string | null;
  timestamp: string | null;
  signature: string | null;
}

/**
 * Verifies a Standard Webhooks signature, as used by Whop.
 *
 * Params:
 *   secret: Signing secret exactly as the provider issued it.
 *   payload: Exact raw request body as received.
 *   headers: The webhook-id, webhook-timestamp, and webhook-signature values.
 *   nowMs: Current time in epoch milliseconds, for replay checking.
 *
 * Returns:
 *   True when the signature matches and the timestamp is within tolerance.
 *
 * Edge cases:
 *   The signed payload is `{id}.{timestamp}.{body}`, so the body must be the
 *   raw text, not a re-serialized object. The header may carry several
 *   space-separated `v1,<signature>` values during a secret rotation; any one
 *   matching is sufficient. Requests older than five minutes are rejected to
 *   prevent replay.
 */
export async function verifyStandardWebhookSignature(
  secret: string,
  payload: string,
  headers: StandardWebhookHeaders,
  nowMs: number
): Promise<boolean> {
  const { id, timestamp, signature } = headers;

  if (!id || !timestamp || !signature) {
    return false;
  }

  const timestampSeconds = Number.parseInt(timestamp, 10);

  if (!Number.isFinite(timestampSeconds)) {
    return false;
  }

  if (
    Math.abs(nowMs - timestampSeconds * 1000) > STANDARD_WEBHOOK_TOLERANCE_MS
  ) {
    return false;
  }

  const provided = signature
    .split(" ")
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .map((part) => (part.startsWith("v1,") ? part.slice(3) : part));

  if (provided.length === 0) {
    return false;
  }

  const signedPayload = `${id}.${timestamp}.${payload}`;

  for (const keyBytes of deriveKeyCandidates(secret)) {
    const { hex, base64 } = await signWith(keyBytes, signedPayload);

    const matched = provided.some(
      (candidate) =>
        timingSafeEqual(candidate, base64) || timingSafeEqual(candidate, hex)
    );

    if (matched) {
      return true;
    }
  }

  return false;
}
