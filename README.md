# CampusCart

CampusCart is a student marketplace for buying, selling, giving away, and swapping
second-hand textbooks, electronics, furniture, and hostel essentials. Listings,
enquiries, offers, and favourites are stored in MongoDB and served through the
Next.js App Router.

## Features

- Browse, search, filter, sort, and paginate live listings.
- Email/password accounts with hashed passwords and signed session cookies.
- Product pages with photo gallery, seller contact details, similar listings, and
  working favourite and enquiry forms.
- Create and edit listings with validated fields and Cloudinary photo uploads.
- Seller dashboard with listing status (available, reserved, sold), deactivation,
  reactivation, deletion, enquiries, and price offers.
- Public seller profiles showing current listings and listing history.
- Account-scoped saved listings.
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

## Prerequisites

- Node.js 20.9 or newer
- npm
- A MongoDB connection string
- A Cloudinary account (needed only for photo uploads)

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment template and fill in the values:

   ```bash
   cp .env.example .env.local
   ```

3. Generate a session secret:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

   Open <http://localhost:3000>, create an account, and publish your first
   listing. There is no sample data: everything in the database comes from real
   users creating listings through the app.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_URL` | Yes | Public origin used for canonical URLs, the sitemap, and robots file. Use `http://localhost:3000` locally and the full HTTPS origin in production. |
| `NEXT_PUBLIC_CONTACT_EMAIL` | No | Optional public support address. When empty, contact links point to the GitHub issue tracker. |
| `SESSION_SECRET` | Yes in production | Signs the session cookies and protects account sessions. The app refuses to start without it in production. |
| `MONGODB_URI` | Yes | MongoDB Atlas or local connection string. |
| `MONGODB_DB` | No | Database name. Defaults to `campus_cart`. |
| `CLOUDINARY_CLOUD_NAME` | For uploads | Cloudinary cloud name. |
| `CLOUDINARY_API_KEY` | For uploads | Cloudinary API key. |
| `CLOUDINARY_API_SECRET` | For uploads | Cloudinary API secret. |

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

## API overview

| Route | Methods | Notes |
| --- | --- | --- |
| `/api/health` | `GET` | Reports API and database status. |
| `/api/auth/signup` | `POST` | Create an account and start a session. |
| `/api/auth/login` | `POST` | Sign in with email and password. |
| `/api/auth/logout` | `POST` | End the current session. |
| `/api/auth/me` | `GET` | Current account, or `null` when signed out. |
| `/api/listings` | `GET`, `POST` | Search/filter listings; create a listing for the signed-in account. |
| `/api/listings/[id]` | `GET`, `PUT`, `DELETE` | Detail, owner edit, owner delete. |
| `/api/listings/[id]/status` | `PATCH` | Change availability. |
| `/api/listings/[id]/deactivate` | `PATCH` | Hide a listing without deleting it. |
| `/api/listings/[id]/reactivate` | `PATCH` | Restore a hidden listing. |
| `/api/enquiries` | `GET`, `POST` | Seller inbox; create an enquiry or offer. |
| `/api/enquiries/[id]` | `PATCH` | Accept, reject, close, or annotate an enquiry. |
| `/api/favorites` | `GET`, `POST` | List or add saved listings for the signed-in account. |
| `/api/favorites/[listingId]` | `GET`, `DELETE` | Check or remove a saved listing. |
| `/api/dashboard` | `GET` | Seller dashboard snapshot. |
| `/api/uploads` | `POST` | Upload up to five images to Cloudinary. |

All mutations validate input on the server. Errors return
`{ success: false, message, code, errors? }` with an appropriate status code.

## How accounts work

- Signing up hashes the password with scrypt (`node:crypto`, no plain-text
  passwords are stored) and sets a signed, HTTP-only `cc_session` cookie.
- The cookie is signed with `SESSION_SECRET` and expires after 30 days. Signing
  out clears it.
- Only the signed-in account can edit, change the status of, or delete the
  listings it created. Saved listings are stored against the account too.
- Listings and sellers are never pre-seeded. The marketplace only contains
  listings real users have published.

## Deployment

### Vercel (recommended)

1. Create a MongoDB Atlas database, add the deployment's outbound IPs to the
   access list (or allow `0.0.0.0/0` if the host has no fixed egress IPs), and
   copy the connection string.
2. Create a Cloudinary account and copy the cloud name, API key, and API secret.
3. Import the repository into Vercel. Keep the detected Next.js settings; the
   build command stays `npm run build`.
4. Add every variable from `.env.example` to the project's Production
   environment (and Preview if you use preview deployments). Set
   `NEXT_PUBLIC_APP_URL` to the final HTTPS origin and generate a strong
   `SESSION_SECRET`.
5. Deploy and open `/api/health`. It should report `"database": "connected"`.
6. In Project → Settings → Domains, add the custom domain. At the registrar,
   create the DNS records Vercel shows (`A 76.76.21.21` for a root domain or the
   `cname.vercel-dns.com` CNAME it provides) and wait for verification and the
   TLS certificate.
7. Set `NEXT_PUBLIC_APP_URL` to the custom domain, redeploy, and confirm
   `/sitemap.xml`, `/robots.txt`, and the Open Graph image use that origin.

The domain and hosting steps require access to the domain and the Vercel
account, so they cannot be completed from inside this repository.

### Self-hosted

Run `npm run build` followed by `npm run start` behind an HTTPS reverse proxy,
and provide the same environment variables. Terminate TLS at the proxy so the
`Secure` session cookie is sent correctly.

## Known limitations

- Passwords are hashed with scrypt and sessions are signed cookies. There is no
  password-reset email flow or two-factor authentication yet.
- No payment processing. Buyers and sellers arrange payment and handover
  directly.
- Seller responses to enquiries are stored as notes. No email is sent, so the
  dashboard tells sellers to contact the buyer directly.
- Spam limiting uses an in-memory counter; it resets when the server restarts and
  is per instance.
- `npm audit` reports moderate issues in the ESLint toolchain. The suggested
  automated fix would downgrade Next.js to version 15, so it is not applied.
  These packages are development-only and are not part of the runtime bundle.
