/**
 * lib/gsc-auth.ts
 * Generates a Google OAuth2 access token from a service account JSON key.
 * Uses Node.js built-in crypto — no external packages needed.
 * 
 * Env var: GOOGLE_SERVICE_ACCOUNT_JSON — the full JSON content of the key file
 */

import { createSign } from "crypto";

type ServiceAccountKey = {
  client_email: string;
  private_key: string;
  token_uri: string;
};

let cachedToken: { token: string; expires: number } | null = null;

export async function getGoogleAccessToken(
  scope = "https://www.googleapis.com/auth/webmasters.readonly"
): Promise<string | null> {
  try {
    // Return cached token if still valid (5 min buffer)
    if (cachedToken && cachedToken.expires > Date.now() + 5 * 60 * 1000) {
      return cachedToken.token;
    }

    const jsonStr = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    if (!jsonStr) return null;

    const key = JSON.parse(jsonStr) as ServiceAccountKey;
    const now = Math.floor(Date.now() / 1000);
    const expiry = now + 3600;

    // Build JWT header + claims
    const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
    const claims = Buffer.from(JSON.stringify({
      iss: key.client_email,
      scope,
      aud: key.token_uri || "https://oauth2.googleapis.com/token",
      exp: expiry,
      iat: now,
    })).toString("base64url");

    const signingInput = `${header}.${claims}`;

    // Sign with RSA-SHA256
    const sign = createSign("RSA-SHA256");
    sign.update(signingInput);
    const signature = sign.sign(key.private_key, "base64url");

    const jwt = `${signingInput}.${signature}`;

    // Exchange JWT for access token
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt,
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[gsc-auth] Token exchange failed:", err);
      return null;
    }

    const data = await res.json() as { access_token: string; expires_in: number };
    
    cachedToken = {
      token: data.access_token,
      expires: Date.now() + (data.expires_in - 60) * 1000,
    };

    return cachedToken.token;
  } catch (err) {
    console.error("[gsc-auth] Error:", err instanceof Error ? err.message : err);
    return null;
  }
}