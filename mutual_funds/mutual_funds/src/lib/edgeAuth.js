import { jwtVerify } from 'jose';

export async function verifyTokenEdge(token, secret) {
  try {
    const enc = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, enc);
    return payload;
  } catch (_) {
    return null;
  }
}
