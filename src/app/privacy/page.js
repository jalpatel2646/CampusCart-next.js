import { SITE } from "@/config/site";

const TITLE = "Privacy policy";
const UPDATED = "16 November 2026";

export const metadata = {
  title: TITLE,
  description:
    "How CampusCart stores listing details, enquiries, favourites, cookies, and uploaded photos.",
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
        Legal
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{TITLE}</h1>
      <p className="mt-2 text-sm text-[var(--color-text-secondary)]">Last updated: {UPDATED}</p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-[var(--color-text-secondary)]">
        <section>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            What CampusCart is
          </h2>
          <p className="mt-2">
            CampusCart is a student marketplace for buying, selling, giving away, and exchanging
            second-hand items. You need an account to publish listings or save favourites, and
            no payments are processed. This policy explains what information the service stores
            and why.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Information we store
          </h2>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li>
              <strong className="text-[var(--color-text-primary)]">Listing details.</strong>{" "}
              Item name, description, category, condition, price or exchange details, photos,
              and the seller&apos;s name, email address, optional phone number, and contact
              preference.
            </li>
            <li>
              <strong className="text-[var(--color-text-primary)]">Account details.</strong>{" "}
              Your name, email address, optional phone number, contact preference, and a scrypt
              hash of your password. The password itself is never stored.
            </li>
            <li>
              <strong className="text-[var(--color-text-primary)]">Enquiries.</strong> The
              buyer&apos;s name and email address, the message, any optional offer price, the
              listing it relates to, and the seller&apos;s response note.
            </li>
            <li>
              <strong className="text-[var(--color-text-primary)]">Favourites.</strong> The
              listings saved against your account.
            </li>
            <li>
              <strong className="text-[var(--color-text-primary)]">Uploaded photos.</strong>{" "}
              Images you upload are stored by Cloudinary and served back to the marketplace.
            </li>
            <li>
              <strong className="text-[var(--color-text-primary)]">Technical data.</strong>{" "}
              Our hosting provider may keep standard request logs. A short-lived, in-memory
              counter uses your IP address to limit spam. It is not used for advertising or
              analytics.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Cookies</h2>
          <p className="mt-2">
            CampusCart uses one first-party session cookie. It is not used for advertising or
            cross-site tracking.
          </p>
          <div className="mt-3 overflow-hidden rounded-lg border border-[var(--color-border)]">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]">
                <tr>
                  <th className="px-3 py-2 font-semibold">Cookie</th>
                  <th className="px-3 py-2 font-semibold">Purpose</th>
                  <th className="px-3 py-2 font-semibold">Lifetime</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                <tr>
                  <td className="px-3 py-2 font-mono text-[11px]">cc_session</td>
                  <td className="px-3 py-2">
                    A signed, HTTP-only session token that keeps you signed in so you can manage
                    your listings, saved items, and enquiries.
                  </td>
                  <td className="px-3 py-2">30 days</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-2">
            The cookie is HTTP-only and SameSite=Lax, and is marked Secure in production. Signing
            out removes it. Clearing site data signs you out on this browser.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Why we use it
          </h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li>To publish, search, filter, and display marketplace listings.</li>
            <li>To let the signed-in account edit, change the status of, or delete its listings.</li>
            <li>To deliver enquiries and offers to the relevant seller.</li>
            <li>To keep each account&apos;s saved listings private to that account.</li>
            <li>To prevent spam, abuse, and attempts to break the service.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Sharing and service providers
          </h2>
          <p className="mt-2">
            Listing and enquiry data is stored in MongoDB Atlas. Listing photos are stored and
            delivered by Cloudinary. The application is served by our hosting provider. These
            providers process data on our behalf to run the service. We do not sell personal
            information or share it for advertising.
          </p>
          <p className="mt-2">
            Listing details, including the seller&apos;s chosen contact details, are visible to
            people who can access the marketplace. Enquiry messages are visible to the seller
            who owns the listing. Do not include information in a listing or enquiry that you do
            not want the other party to see.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Retention and deletion
          </h2>
          <p className="mt-2">
            Listings remain until they are deleted, and deactivated listings are hidden from the
            public marketplace. Deleted listings are removed, along with their saved favourites.
            Enquiries are kept as seller history after a listing is deleted, with pending
            enquiries closed. Favourites remain until you remove them or delete your account.
          </p>
          <p className="mt-2">
            Access is tied to your account. If you lose access to your email or want your account
            data corrected or deleted, contact us through the project issue tracker with the
            email address you signed up with.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Your choices</h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li>Remove saved listings from the saved-listings page at any time.</li>
            <li>Edit, reserve, mark sold, deactivate, or delete your listings from the dashboard.</li>
            <li>Sign out at any time from the navigation bar.</li>
            <li>Ask for a correction or deletion through the contact channel below.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Security</h2>
          <p className="mt-2">
            We hash passwords with scrypt, use server-side validation, sign HTTP-only session
            cookies, and check account ownership before a listing or enquiry can be changed. No
            service is perfectly secure, and marketplace meetings carry their own risks. Meet in
            a public place and inspect items before paying.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Children</h2>
          <p className="mt-2">
            CampusCart is intended for college and university students and is not directed at
            children under 13. Do not create listings if you are not old enough to enter into an
            agreement for the item.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Changes to this policy
          </h2>
          <p className="mt-2">
            We may update this policy when the service changes. The date at the top of this page
            shows the latest version. Continued use after a change means you accept the updated
            policy.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Contact</h2>
          <p className="mt-2">
            For privacy questions or data requests, open an issue at{" "}
            <a
              href={SITE.issues}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[var(--color-primary)] underline underline-offset-2 hover:text-[var(--color-primary-hover)]"
            >
              the CampusCart issue tracker
            </a>
            {SITE.contactEmail ? (
              <>
                {" "}
                or email{" "}
                <a
                  href={`mailto:${SITE.contactEmail}`}
                  className="font-medium text-[var(--color-primary)] underline underline-offset-2 hover:text-[var(--color-primary-hover)]"
                >
                  {SITE.contactEmail}
                </a>
              </>
            ) : null}
            . Include the relevant listing or enquiry link so we can find the record.
          </p>
        </section>
      </div>
    </article>
  );
}
