import {
  hmacSha256,
  verifyRevenueCatWebhookSignature,
} from "../../convex/_webhooks";

describe("verifyRevenueCatWebhookSignature", () => {
  const secret = "rc_signing_secret";
  const payload = '{"event":{"id":"evt_1"}}';
  const nowMs = Date.UTC(2026, 7, 23, 22, 0, 0);
  const timestamp = String(nowMs / 1000);

  it("accepts RevenueCat's timestamped v1 HMAC", async () => {
    const { hex } = await hmacSha256(secret, `${timestamp}.${payload}`);

    await expect(
      verifyRevenueCatWebhookSignature(
        secret,
        payload,
        `t=${timestamp},v1=${hex}`,
        nowMs
      )
    ).resolves.toBe(true);
  });

  it("rejects signatures outside the replay window", async () => {
    const staleTimestamp = String((nowMs - 6 * 60 * 1000) / 1000);
    const { hex } = await hmacSha256(secret, `${staleTimestamp}.${payload}`);

    await expect(
      verifyRevenueCatWebhookSignature(
        secret,
        payload,
        `t=${staleTimestamp},v1=${hex}`,
        nowMs
      )
    ).resolves.toBe(false);
  });

  it("rejects the legacy unversioned signature format", async () => {
    const { hex } = await hmacSha256(secret, payload);

    await expect(
      verifyRevenueCatWebhookSignature(secret, payload, hex, nowMs)
    ).resolves.toBe(false);
  });
});
