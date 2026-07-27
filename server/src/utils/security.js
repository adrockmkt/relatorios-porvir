import crypto from 'crypto';
import { env } from '../config/env.js';

export function generateId() {
  return crypto.randomUUID();
}

export function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

export function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const derivedKey = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derivedKey}`;
}

export function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(':')) {
    return false;
  }

  const [salt, key] = storedHash.split(':');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  const storedKey = Buffer.from(key, 'hex');

  if (derivedKey.length !== storedKey.length) {
    return false;
  }

  return crypto.timingSafeEqual(derivedKey, storedKey);
}

export function createSessionExpiry() {
  const ttlHours = Number.isFinite(env.sessionTtlHours) && env.sessionTtlHours > 0 ? env.sessionTtlHours : 24;
  return new Date(Date.now() + ttlHours * 60 * 60 * 1000).toISOString();
}

export function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email));
}

export function isStrongEnoughPassword(password) {
  return typeof password === 'string' && password.length >= 8;
}
