import { Suspense } from "react";
import { connection } from "next/server";
import { adminConfigured } from "@/lib/admin-auth";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="mx-auto mt-10 max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="mb-4 text-xl font-bold">Sign in to edit your site</h1>
      <Suspense fallback={<p className="text-sm text-slate-500">Loading…</p>}>
        <LoginBody />
      </Suspense>
    </div>
  );
}

// Checked per request, so setting ADMIN_PASSWORD doesn't depend on what the build saw.
async function LoginBody() {
  await connection();
  if (adminConfigured()) return <LoginForm />;
  return (
    <p className="text-sm text-slate-700">
      The admin is turned off because no password is set. Add an <code className="rounded bg-slate-100 px-1">ADMIN_PASSWORD</code>{" "}
      environment variable in Netlify (Project configuration → Environment variables) and redeploy.
    </p>
  );
}
