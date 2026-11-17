import { SITE } from "@/config/site";

const TITLE = "Terms and conditions";
const UPDATED = "16 November 2026";

export const metadata = {
  title: TITLE,
  description: "The rules for buying, selling, giving away, and exchanging items on CampusCart.",
};

export default function TermsPage() {
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
            Using CampusCart
          </h2>
          <p className="mt-2">
            By using CampusCart, you agree to these terms. If you do not agree, do not use the
            marketplace. CampusCart is a listing service for college and university students. It
            does not buy, sell, ship, inspect, or deliver items, and it does not process payments.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Who can use it
          </h2>
          <p className="mt-2">
            You must be old enough to enter into an agreement for the items you list or buy, and
            you must be able to use the service lawfully in your location. If you use CampusCart
            on behalf of an organisation, you confirm you have authority to accept these terms
            for it.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Listings</h2>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li>
              List only items you own or are authorised to sell, give away, or exchange, and
              describe their condition, contents, and defects accurately.
            </li>
            <li>
              Use photos of the actual item. Do not use misleading stock images, another
              person&apos;s photos, or images that hide damage.
            </li>
            <li>
              Keep the listing status current. Mark an item reserved when a handover is agreed
              and sold when it is no longer available.
            </li>
            <li>
              Do not list stolen property, weapons, controlled substances, alcohol, tobacco,
              counterfeit goods, recalled or hazardous items, live animals, or anything that is
              illegal to sell or give away.
            </li>
            <li>
              Do not list academic work intended to be submitted as someone else&apos;s, or
              services that help someone cheat.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Buyers and sellers deal directly
          </h2>
          <p className="mt-2">
            CampusCart only introduces people. Any agreement, payment, handover, exchange, or
            dispute is between the buyer and the seller. CampusCart is not a party to it. Do not
            send deposits or pay in advance without inspecting the item and confirming the
            seller. Meet in a public campus location.
          </p>
          <p className="mt-2">
            Sellers are responsible for honouring the terms they agree with a buyer. Buyers are
            responsible for inspecting items and asking questions before paying.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Enquiries and conduct
          </h2>
          <p className="mt-2">
            Use enquiries for genuine questions and offers about a listing. Do not send spam,
            harass people, impersonate someone else, scrape the service, attempt to bypass
            security, or use another person&apos;s contact details for unrelated purposes.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Content and ownership
          </h2>
          <p className="mt-2">
            You keep ownership of the text and photos you post. By publishing a listing, you give
            CampusCart permission to store, display, resize, and share that content as needed to
            run the marketplace. Do not post content that infringes someone else&apos;s rights.
            The CampusCart name, design, and code remain the property of their respective owners.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Removing content and access
          </h2>
          <p className="mt-2">
            We may remove a listing, close an enquiry, or block access to the service when we
            believe these terms have been broken, a listing is unsafe or unlawful, or the
            service is being abused. We do not guarantee that any listing will remain available
            or that a particular item will be found.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            No warranties
          </h2>
          <p className="mt-2">
            The service is provided on an “as is” and “as available” basis. To the fullest extent
            permitted by law, CampusCart makes no warranty about the accuracy of a listing, the
            condition or legality of an item, the conduct of a buyer or seller, or uninterrupted
            availability of the service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Limitation of liability
          </h2>
          <p className="mt-2">
            To the fullest extent permitted by law, CampusCart is not liable for indirect,
            incidental, special, consequential, or punitive losses, or for loss of money,
            property, data, or opportunity arising from a transaction or from use of the service.
            Nothing in these terms limits a liability that cannot lawfully be limited.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Changes to the service or terms
          </h2>
          <p className="mt-2">
            We may change, suspend, or discontinue parts of CampusCart, and we may update these
            terms. The date at the top of this page shows the latest version. If you keep using
            the service after a change, you accept the updated terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Governing law
          </h2>
          <p className="mt-2">
            These terms are governed by the laws of India, without regard to conflict-of-law
            rules. Any dispute that cannot be resolved informally will be subject to the
            jurisdiction of the courts located where the service operator is established.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Contact</h2>
          <p className="mt-2">
            Questions about these terms, a listing, or a transaction can be raised at{" "}
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
                or by email at{" "}
                <a
                  href={`mailto:${SITE.contactEmail}`}
                  className="font-medium text-[var(--color-primary)] underline underline-offset-2 hover:text-[var(--color-primary-hover)]"
                >
                  {SITE.contactEmail}
                </a>
              </>
            ) : null}
            .
          </p>
        </section>
      </div>
    </article>
  );
}
