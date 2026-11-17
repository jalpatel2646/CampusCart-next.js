# CampusCart

A student marketplace for buying, selling, giving away, and swapping second-hand
textbooks, electronics, furniture, and hostel essentials — listings, enquiries,
offers, favourites, notifications, and saved searches are all backed by
MongoDB and served by the Next.js App Router.

## What it is

CampusCart connects students on campus who want to offload books, calculators,
and furniture with students who need the same — at student-friendly prices. It
covers the whole loop a student runs through:

1. **Publish** — post an item with photos and a price (or mark it Free or
   Exchange), optionally let AI generate the description or suggest a category.
2. **Discover** — browse the marketplace, search and filter by category,
   condition, price, or pickup location, sort results, and page through them.
3. **Contact** — send an enquiry with an optional offer, or tap the seller's
   contact preference directly from the listing page.
4. **Negotiate** — the seller accepts, rejects, or closes the enquiry and can
   add a response note; or the buyer makes an offer which the seller accepts
   or rejects.
5. **Save and manage** — the buyer saves interesting listings to favourites;
   both sides manage everything from the seller dashboard or the buyer
   inbox at `/enquiries`.

## Features

- Browse, search, filter, sort, and paginate live listings, including a
  pickup-location facet (hostels, library, sports complex) discovered from live
  listings.
- Email/password accounts with hashed passwords (scrypt) and signed session
  cookies.
- Product pages with photo gallery, seller contact details, similar listings,
  and working favourite and enquiry forms.
- Create and edit listings with validated fields and up-to-5-image Cloudinary
  uploads.
- Optional AI assist in the listing form (generate description, suggest
  category) via OpenRouter; auto-disabled without a key.
- Seller dashboard with listing status (available, reserved, sold),
  deactivation, reactivation, deletion, enquiries, and price offers.
- Public seller profiles showing current listings and listing history.
- Account-scoped saved listings.
- Buyer inbox at `/enquiries` listing outgoing enquiries with the seller's
  responses, plus unread notifications delivered in-app with a navbar badge.
- Saved searches at `/dashboard/searches` with new-match counts.
- QR code share control on every product page (inline SVG QR, copy link,
  save PNG, native Web Share).
- Privacy policy and terms pages.
- Database-aware health endpoint at `/api/health` and generated `sitemap.xml`,
  `robots.txt`, icons, and Open Graph image.

## Technology

- Next.js 16 (App Router, Cache Components, Turbopack)
- React 19
- JavaScript
- Tailwind CSS 4
- MongoDB Atlas with Mongoose
- React Hook Form and Zod
- Cloudinary for listing photos
- Lucide icons and Sonner toasts

## Project layout

```
src/
  app/                 App Router pages (see Pages below)
    api/               API route handlers (see API routes below)
  components/          UI components, grouped by feature
    common/            Button, Input, Modal, Badge, EmptyState, Skeleton, …
    dashboard/         Dashboard-specific pieces (ListingActions, EnquiryList…)
    home/              Home page sections (hero, stats, features…)
    layout/            Navbar, SiteHeader, Footer, PageContainer
    listings/          ListingForm, ImageUploader
    marketplace/       ListingCard, MarketplaceBrowser, EnquiryForm, …
    notifications/     MarkAllSeenOnMount
  lib/                 Shared helpers (mongodb, session, api client, validators,
                       ownership, errors, validation schemas)
    validation/        Client-side zod schemas used by the forms
  models/              Mongoose models (listing, enquiry, favorite, seller,
                       saved-search, notification)
  services/            Service layer used by route handlers
    listing.service.js, enquiry.service.js, assist.service.js, …
  config/site.js       Site-wide config (name, URL, repository, issues link)
```

## Pages

| Route | Description |
| --- | --- |
| `/` | Home — featured listings, categories, free/swap picks, stats |
| `/marketplace` | Browse, search, filter, sort, paginate; share/discover listings |
| `/product/[id]` | Full listing page: gallery, price, condition, seller card, similar listings, enquiry form, QR share |
| `/seller/[id]` | Public seller profile: contact preference, current listings, listing history |
| `/favorites` | Listings saved to the signed-in account |
| `/enquiries` | Buyer inbox: outgoing enquiries with status and the seller's response |
| `/create-listing` | Post a new listing (auth required) |
| `/edit-listing/[id]` | Edit a listing you own (auth required) |
| `/dashboard` | Seller overview — listings by status, pending enquiries and offers |
| `/dashboard/listings` | Manage your listings: status, edit, deactivate, delete |
| `/dashboard/enquiries` | Seller inbox — accept, reject, close, or annotate |
| `/dashboard/offers` | Offers-only view of enquiries with an `offerPrice` |
| `/dashboard/searches` | Saved searches with new-match badges (beyond the original spec) |
| `/login` / `/signup` | Account auth |
| `/privacy` / `/terms` | Legal pages |
| `/sitemap.xml` / `/robots.txt` | SEO |

## API routes

| Route | Methods | Notes |
| --- | --- | --- |
| `/api/health` | `GET` | Reports API and database status |
| `/api/auth/signup` | `POST` | Create an account and start a session |
| `/api/auth/login` | `POST` | Sign in with email and password |
| `/api/auth/logout` | `POST` | End the current session |
| `/api/auth/me` | `GET` | Current account, or `null` when signed out |
| `/api/listings` | `GET`, `POST` | Search/filter listings; create a listing for the signed-in account |
| `/api/listings/[id]` | `GET`, `PUT`, `DELETE` | Detail, owner edit, owner delete |
| `/api/listings/[id]/status` | `PATCH` | Change availability (Available / Reserved / Sold) |
| `/api/listings/[id]/deactivate` | `PATCH` | Hide a listing without deleting it |
| `/api/listings/[id]/reactivate` | `PATCH` | Restore a hidden listing |
| `/api/listings/[id]/similar` | `GET` | Similar listings in the same category |
| `/api/listings/assist` | `POST` | AI assist for the listing form (`describe` / `classify`); signed-in accounts only |
| `/api/enquiries` | `GET`, `POST` | Seller inbox; create an enquiry or offer. `GET ?sent=true` returns the signed-in buyer's outgoing enquiries |
| `/api/enquiries/[id]` | `PATCH` | Accept, reject, close, or annotate an enquiry |
| `/api/notifications` | `GET` | Notification inbox and unread count for the signed-in account |
| `/api/notifications/[id]/seen` | `POST` | Mark one notification read |
| `/api/notifications/seen` | `POST` | Mark all notifications read |
| `/api/favorites` | `GET`, `POST` | List or add saved listings for the signed-in account |
| `/api/favorites/[listingId]` | `GET`, `DELETE` | Check or remove a saved listing |
| `/api/dashboard` | `GET` | Seller dashboard snapshot |
| `/api/uploads` | `POST` | Upload up to five images to Cloudinary |
| `/api/saved-searches` | `GET`, `POST` | Manage saved searches for the signed-in account |
| `/api/saved-searches/[id]` | `DELETE` | Remove a saved search |
| `/api/saved-searches/[id]/seen` | `POST` | Mark one saved search as seen (resets the new-matches badge) |
| `/api/saved-searches/seen` | `POST` | Mark all saved searches as seen |

All mutations validate input on the server. Errors return
`{ success: false, message, code, errors? }` with an appropriate status code.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_URL` | Yes | Public origin used for canonical URLs, the sitemap, and robots file. `http://localhost:3000` locally, the real origin in production. |
| `NEXT_PUBLIC_CONTACT_EMAIL` | No | Optional public support address. When empty, contact links point to the GitHub issue tracker. |
| `SESSION_SECRET` | Yes in production | Signs the session cookies and protects account sessions. The app refuses to start without it in production. |
| `MONGODB_URI` | Yes | MongoDB Atlas or local connection string. |
| `MONGODB_DB` | No | Database name. Defaults to `campus_cart`. |
| `CLOUDINARY_CLOUD_NAME` | For uploads | Cloudinary cloud name. |
| `CLOUDINARY_API_KEY` | For uploads | Cloudinary API key. |
| `CLOUDINARY_API_SECRET` | For uploads | Cloudinary API secret. |
| `OPENROUTER_API_KEY` | Optional | Enables the AI assist buttons in the listing form (generate description, suggest category). |
| `OPENROUTER_MODEL` | Optional | OpenRouter model id; defaults to `baidu/ernie-5.5-flash-preview:free`. |

Without Cloudinary credentials the site still works, but photo uploads return a
`503` with a clear message instead of silently failing.

Never commit `.env.local` or any real credentials.

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the development server. |
| `npm run build` | Production build. |
| `npm run start` | Serve the production build. |
| `npm run lint` | Run ESLint. |

## How accounts work

- Signing up hashes the password with scrypt (`node:crypto`, no plain-text
  passwords are stored) and sets a signed, HTTP-only `cc_session` cookie.
- The cookie is signed with `SESSION_SECRET` and expires after 30 days. Signing
  out clears it.
- Only the signed-in account can edit, change the status of, or delete the
  listings it created. Saved listings are stored against the account too.
- Listings and sellers are never pre-seeded. The marketplace only contains
  listings real users have published.

## Known limitations

- Passwords are hashed with scrypt and sessions are signed cookies. There is no
  password-reset email flow or two-factor authentication yet.
- No payment processing. Buyers and sellers arrange payment and handover
  directly.
- Seller responses to enquiries are delivered in-app for signed-in buyers.
  Guest buyers are not notified by email; they only see the response when they
  revisit the listing or sign in to their inbox.
- Saved searches and notifications are account-scoped and in-app only.
- Spam limiting uses an in-memory fixed-window counter. It is per server
  instance, so Vercel may run several concurrent instances and cold starts
  lose the counter. Clients are keyed by `x-vercel-forwarded-for` (Vercel
  documents this as the same IP as `x-forwarded-for`, but not overridable by
  an upstream proxy), falling back to `x-forwarded-for` then `x-real-ip`; if
  no identifiable IP is visible the caller shares one bounded "unknown"
  bucket instead of an empty-KeyMap bucket. Signup is limited to 10/hour per
  IP, login to 15 per 15 minutes. For durable, global limiting use a shared
  store (e.g. Upstash Redis / Vercel KV) with `INCR` + `EXPIRE`; the 429
  contract (`RATE_LIMITED` + `retryAfterSeconds`) is already compatible with
  that swap.
- `npm audit` reports moderate issues in the ESLint toolchain. The suggested
  automated fix would downgrade Next.js to version 15, so it is not applied.
  These packages are development-only and are not part of the runtime bundle.
