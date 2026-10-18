import type { Metadata } from "next";
import { site } from "@/config/site";

export const metadata: Metadata = { title: "Privacy Policy" };

// TODO(compliance): have this reviewed against PIPEDA and your brokerage's own privacy policy before launch.
export default function PrivacyPage() {
  return (
    <article className="prose mx-auto w-full max-w-3xl px-4 py-12 text-slate-700 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-slate-900 [&_p]:mt-3">
      <h1 className="text-3xl font-bold text-slate-900">Privacy policy</h1>
      <p className="text-sm text-slate-500">Draft — pending review by {site.brokerage.name}.</p>
      <h2>Who we are</h2>
      <p>
        This website is operated by {site.agent.name}, {site.agent.title} with {site.brokerage.name}. We follow the
        Personal Information Protection and Electronic Documents Act (PIPEDA).
      </p>
      <h2>What we collect</h2>
      <p>
        When you submit a form we collect the details you provide — your name, email, phone number and message — and
        the page you sent it from. We use basic, privacy-respecting analytics to understand how the site is used.
      </p>
      <h2>How we use it</h2>
      <p>
        Your details are used only to respond to your enquiry and to provide real estate services you request. We send
        listing updates or other marketing email only if you have given express consent, and every such email includes
        an unsubscribe link, as required by Canada&apos;s Anti-Spam Legislation (CASL).
      </p>
      <h2>Sharing</h2>
      <p>
        We do not sell your personal information. It may be shared with {site.brokerage.name} as required for brokerage
        record-keeping, and with service providers (such as email delivery) who process it on our behalf.
      </p>
      <h2>Your choices</h2>
      <p>
        You can ask to access, correct or delete your information, or withdraw consent, by emailing{" "}
        <a className="underline" href={`mailto:${site.agent.email}`}>{site.agent.email}</a>.
      </p>
    </article>
  );
}
