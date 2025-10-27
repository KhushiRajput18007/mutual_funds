import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return { salt, hash };
}

export function verifyPassword(password, salt, hash) {
  const { hash: newHash } = hashPassword(password, salt);
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(newHash, 'hex'));
}

export function signToken(payload, secret, expiresIn = '7d') {
  return jwt.sign(payload, secret, { expiresIn });
}

export function verifyToken(token, secret) {
  try {
    return jwt.verify(token, secret);
  } catch (_) {
    return null;
  }
}

export function getAuth(request) {
  const token = request.cookies.get?.('token')?.value || request.headers.get?.('authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const jwtSecret = process.env.JWT_SECRET || 'dev-secret-change-me';
  const payload = verifyToken(token, jwtSecret);
  if (!payload) return null;
  return { userId: payload.sub, role: payload.role };
}
