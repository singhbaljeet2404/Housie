// Single-user admin auth: the password lives in the ADMIN_PASSWORD environment
// variable; a signed, expiring cookie marks a signed-in browser.

import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { redirect } from "next/navigation";

export const SESSION_COOKIE = "housie_admin";
const SESSION_DAYS = 7;

export const adminConfigured = () => Boolean(process.env.ADMIN_PASSWORD);

function secret() {
  // A separate secret lets you rotate sessions without changing the password.
  return process.env.ADMIN_SESSION_SECRET || createHash("sha256").update(`housie:${process.env.ADMIN_PASSWORD}`).digest("hex");
}

const sign = (payload: string) => createHmac("sha256", secret()).update(payload).digest("base64url");

function safeEqual(a: string, b: string) {
  const ab = createHash("sha256").update(a).digest();
  const bb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ab, bb);
}

export function checkPassword(candidate: string) {
  const expected = process.env.ADMIN_PASSWORD;
  return Boolean(expected) && safeEqual(candidate, expected!);
}

export function createSessionValue(now = Date.now()) {
  const payload = `admin.${now + SESSION_DAYS * 86_400_000}`;
  return `${payload}.${sign(payload)}`;
}

export function verifySessionValue(value: string | undefined, now = Date.now()) {
  if (!value || !adminConfigured()) return false;
  const i = value.lastIndexOf(".");
  const payload = value.slice(0, i);
  const signature = value.slice(i + 1);
  if (!payload.startsWith("admin.") || !safeEqual(signature, sign(payload))) return false;
  return Number(payload.slice("admin.".length)) > now;
}

export async function setSessionCookie() {
  (await cookies()).set(SESSION_COOKIE, createSessionValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 86_400,
  });
}

export async function clearSessionCookie() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function isAdmin() {
  // Opt out of prerendering before touching the clock (session expiry): on Netlify
  // the shell prerender can see request cookies, and Date.now() there is an error.
  await connection();
  return verifySessionValue((await cookies()).get(SESSION_COOKIE)?.value);
}

// Call at the top of every admin page and every admin server action.
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
