# Product Requirements Document (PRD)

## CampusCart – Student Second-Hand Marketplace

| Field | Value |
|---|---|
| Project Name | CampusCart |
| Project Type | Student Second-Hand Marketplace |
| Phase | Phase 0 – Product Requirements Document |
| Technology | Next.js (App Router), JavaScript, React, Tailwind CSS, MongoDB, Mongoose |
| Repository | https://github.com/jalpatel2646/CampusCart-next.js |
| Official Problem Statement | https://github.com/codinggita/CGxSU_Semester_1/blob/main/Semester_3/NextJS/nextjs-portfolio-project.md |
| Selected Problem | Project 5 – Second-Hand Marketplace for Students |
| Status | Draft – Awaiting Approval |

---

## 1. Project Overview

CampusCart is a student-focused online marketplace where college students can buy, sell, give away, or exchange second-hand products. The platform centralizes listings for affordable textbooks, calculators, electronics, furniture, stationery, and other study-related products, enabling students to discover, enquire, offer prices, and save favorites.

### 1.1 Vision
To become the trusted, lightweight second-hand marketplace exclusively for college students, reducing waste and lowering the cost of academic essentials.

### 1.2 Mission
Provide a simple, responsive, and maintainable web application that lets students publish, discover, and manage second-hand listings without requiring authentication.

### 1.3 Scope Summary
- Public, no-authentication marketplace.
- Four core data collections: Sellers, Listings, Enquiries, Favorites.
- REST APIs implemented via Next.js Route Handlers.
- Image storage via Cloudinary.
- Deployment on Vercel.

---

## 2. Problem Statement

Students frequently need affordable academic products while other students possess unused items. There is no centralized, student-focused platform for second-hand exchange. Existing general marketplaces lack student-specific categories, trust context, and simplicity. CampusCart solves this by offering a focused, easy-to-use marketplace with listing management, discovery, enquiries, offers, favorites, and seller dashboards.

### 2.1 Pain Points
- Difficulty finding affordable textbooks and electronics near campus.
- Scattered listings across chat groups and notice boards.
- No structured way to track offers and enquiries.
- Sellers lack tools to manage listing lifecycle.

### 2.2 Proposed Solution
A centralized Next.js application with MongoDB persistence, supporting the full listing lifecycle from creation to sale, buyer discovery, enquiry/offer workflow, favorites, and seller analytics.

---

## 3. Project Goals

| ID | Goal |
|---|---|
| G-001 | Enable students to publish second-hand listings quickly. |
| G-002 | Enable students to discover products via search, filters, and sorting. |
| G-003 | Enable buyer-to-seller communication through enquiries and offers. |
| G-004 | Enable sellers to manage listings, enquiries, and offers. |
| G-005 | Provide a seller dashboard with key metrics. |
| G-006 | Allow buyers to save favorite listings. |
| G-007 | Maintain data consistency and server-side validation. |
| G-008 | Deliver a responsive, accessible, modern UI. |
| G-009 | Deploy successfully on Vercel with MongoDB Atlas. |

---

## 4. Target Users

| User Segment | Description |
|---|---|
| College Students (Buyers) | Students seeking affordable second-hand academic products. |
| College Students (Sellers) | Students with unused products to sell, donate, or exchange. |
| Demo Operator | Instructor/reviewer operating the app without authentication. |

---

## 5. User Roles

### 5.1 Buyer
A student who discovers and acquires products.

Capabilities:
- Browse marketplace listings.
- Search products by name and description.
- Filter and sort products.
- View product details.
- View seller information.
- Send enquiries.
- Submit optional price offers.
- Save favorite listings.

### 5.2 Seller
A student who lists products.

Capabilities:
- Create product listings.
- Edit product details.
- Deactivate listings.
- Delete listings.
- Mark products as available, reserved, or sold.
- Manage received enquiries.
- Accept or reject offers.
- View listing history.

### 5.3 Marketplace Administrator / Demo Operator
No authentication-based admin system is built. Administrative or demonstration interfaces are optional future enhancements, not mandatory modules.

---

## 6. Functional Requirements

### 6.1 General
- FR-001: The system shall allow public access to all marketplace features without authentication.
- FR-002: The system shall validate all incoming data on the server.
- FR-003: The system shall store product images on Cloudinary.
- FR-004: The system shall persist data in MongoDB Atlas via Mongoose.
- FR-005: The system shall expose REST APIs via Next.js Route Handlers.

### 6.2 Product Listings (Module 1)
- FR-010: The system shall allow creation of a new listing with name, description, price, category, condition, images, listing type, and seller reference.
- FR-011: Product name shall be required, 3–100 characters.
- FR-012: Product description shall be required, 10–2000 characters.
- FR-013: Selling price shall be a non-negative number; required and > 0 for "For Sale" listings; 0 for "Free" listings.
- FR-014: Category shall be one of: Books, Electronics, Furniture, Stationery, Other.
- FR-015: Condition shall be one of: Like New, Good, Fair, Used.
- FR-016: Listing type shall be one of: For Sale, Free, Exchange.
- FR-017: Exchange listings shall include an exchange description (1–500 characters).
- FR-018: At least one image shall be required; maximum 5 images.
- FR-019: Each listing shall have a status: Available, Reserved, Sold.
- FR-020: Default listing status shall be Available.
- FR-021: The system shall allow editing existing listings.
- FR-022: The system shall allow deactivating listings (isActive = false).
- FR-023: The system shall allow deleting listings.
- FR-024: The system shall allow updating product availability (status).
- FR-025: Deactivated listings shall not appear in marketplace discovery.
- FR-026: Sold listings shall not appear as available products.

### 6.3 Marketplace Discovery (Module 2)
- FR-030: The system shall display all available, active listings.
- FR-031: The system shall support search by product name.
- FR-032: The system shall support search by description.
- FR-033: The system shall support filter by category.
- FR-034: The system shall support filter by minimum price.
- FR-035: The system shall support filter by maximum price.
- FR-036: The system shall support filter by condition.
- FR-037: The system shall support sort by newest.
- FR-038: The system shall support sort by lowest price.
- FR-039: The system shall support sort by highest price.
- FR-040: The system shall support sort by relevance (text search score).
- FR-041: The system shall display individual product details.
- FR-042: The system shall display similar product listings on detail page.
- FR-043: The system shall render loading, empty, and error states.

### 6.4 Seller Profiles (Module 3)
- FR-050: The system shall display seller name, email, contact info, and contact preferences.
- FR-051: The system shall display seller's active listings.
- FR-052: The system shall display seller's listing history.
- FR-053: The system shall display seller info on product details pages.

### 6.5 Enquiries and Offers (Module 4)
- FR-060: Buyers shall submit enquiries with a message.
- FR-061: Enquiry message shall be required, 1–1000 characters.
- FR-062: Buyers may submit an optional offer price (non-negative number).
- FR-063: Sellers shall view received enquiries.
- FR-064: Sellers shall accept an offer/enquiry.
- FR-065: Sellers shall reject an offer/enquiry.
- FR-066: Buyers shall view enquiry responses.
- FR-067: Enquiry status shall be one of: Pending, Accepted, Rejected, Closed.
- FR-068: Default enquiry status shall be Pending.
- FR-069: Sellers shall not accept or reject the same enquiry multiple times.
- FR-070: The system shall track enquiry history.
- FR-071: Listing sold shall close or mark related pending enquiries appropriately.

### 6.6 Favorites (Module 5)
- FR-080: Buyers shall add a listing to favorites.
- FR-081: Buyers shall remove a listing from favorites.
- FR-082: Buyers shall view all saved listings.
- FR-083: The system shall prevent duplicate favorite records for same buyer and listing.
- FR-084: The system shall handle sold or deleted listings in favorites gracefully.
- FR-085: The system shall display appropriate empty states.

### 6.7 Seller Dashboard (Module 6)
- FR-090: Dashboard shall display total listings.
- FR-091: Dashboard shall display active listings.
- FR-092: Dashboard shall display sold listings.
- FR-093: Dashboard shall display reserved listings.
- FR-094: Dashboard shall display received enquiries.
- FR-095: Dashboard shall display pending offers.
- FR-096: Dashboard shall display accepted offers.
- FR-097: Dashboard shall display rejected offers.
- FR-098: Dashboard shall support listing management.
- FR-099: Dashboard shall support enquiry management.
- FR-100: Dashboard shall support offer management.
- FR-101: Dashboard shall support listing history.
- FR-102: Dashboard shall support status updates.

---

## 7. Module Specifications

### Module 1: Product Listings
Fields: name, description, price, category, condition, images[], listingType, exchangeDescription (conditional), status, isActive, seller (ref), createdAt, updatedAt.

Validation: see FR-011..FR-020. Images stored as Cloudinary URLs.

### Module 2: Marketplace Discovery
Query parameters: search, category, minPrice, maxPrice, condition, sort, page, limit. Returns paginated list of active available listings.

### Module 3: Seller Profiles
Seller document with name, email, phone, contactPreference, createdAt. Linked to listings via seller ObjectId.

### Module 4: Enquiries and Offers
Enquiry document with listing, buyerName, buyerEmail, message, offerPrice, status, sellerResponse, createdAt, updatedAt. Workflow: Buyer submits → Pending → Seller accepts/rejects → Accepted/Rejected → Closed (optional).

### Module 5: Favorites
Favorite document with buyerId (demo buyer identifier), listing (ref), createdAt. Unique compound index on (buyerId, listing).

### Module 6: Seller Dashboard
Aggregations over listings and enquiries for a given seller.

---

## 8. User Stories

### Buyer
- US-B01: As a buyer, I want to browse all available listings so I can find products.
- US-B02: As a buyer, I want to search by name/description so I can find specific items.
- US-B03: As a buyer, I want to filter by category/price/condition so I can narrow results.
- US-B04: As a buyer, I want to sort results so I can prioritize cheapest/newest.
- US-B05: As a buyer, I want to view product details and seller info.
- US-B06: As a buyer, I want to send enquiries with optional offers.
- US-B07: As a buyer, I want to view enquiry responses.
- US-B08: As a buyer, I want to save favorite listings.

### Seller
- US-S01: As a seller, I want to create listings with images.
- US-S02: As a seller, I want to edit my listings.
- US-S03: As a seller, I want to deactivate/delete listings.
- US-S04: As a seller, I want to update availability status.
- US-S05: As a seller, I want to view received enquiries.
- US-S06: As a seller, I want to accept/reject offers.
- US-S07: As a seller, I want to view my dashboard metrics.
- US-S08: As a seller, I want to view listing history.

---

## 9. User Workflows

### 9.1 Create Listing Workflow
1. Seller opens Create Listing page.
2. Fills form (name, description, price, category, condition, type, exchange desc if needed, images).
3. Client validates; submits to POST /api/listings.
4. Server validates, uploads images to Cloudinary, creates listing.
5. Redirect to listing detail or dashboard.

### 9.2 Discovery Workflow
1. Buyer opens Marketplace.
2. Applies search/filters/sort.
3. API returns paginated results.
4. Buyer clicks product → detail page.
5. Views seller info and similar listings.

### 9.3 Enquiry Workflow
1. Buyer on product detail submits enquiry (message + optional offer).
2. POST /api/enquiries creates Pending enquiry.
3. Seller views in dashboard/enquiries page.
4. Seller accepts or rejects (single action).
5. Status updated; buyer sees response.

### 9.4 Favorite Workflow
1. Buyer clicks favorite toggle on product card/detail.
2. POST/DELETE /api/favorites.
3. Favorites page lists saved listings, handling sold/deleted.

### 9.5 Seller Dashboard Workflow
1. Seller opens dashboard.
2. GET /api/sellers/:id/dashboard returns metrics.
3. Manage listings/enquiries/status.

---

## 10. Business Rules

- BR-001: Sold listings must not appear as available products.
- BR-002: Reserved listings must be clearly identified in UI.
- BR-003: Free listings must not require price > 0 (price = 0).
- BR-004: Exchange listings must support an exchange description.
- BR-005: Offer must be non-negative when provided.
- BR-006: Sellers cannot accept/reject the same enquiry multiple times.
- BR-007: Deactivated listings must not appear in normal discovery.
- BR-008: Deleted listings must be handled safely when referenced by favorites or enquiries (soft handling: remove from favorites, mark enquiries closed).
- BR-009: Product and seller references must maintain DB consistency (valid ObjectIds).
- BR-010: All incoming data validated on server.
- BR-011: Prevent invalid listing status transitions (e.g., Sold → Available not allowed; Available→Reserved→Sold or Available→Sold allowed).
- BR-012: When a listing becomes sold, related pending enquiries are marked Closed (or Rejected) and no new enquiries accepted.

### 10.1 Status Transition Matrix
| From | Allowed To |
|---|---|
| Available | Reserved, Sold, (deactivated) |
| Reserved | Available, Sold |
| Sold | (none – terminal) |

---

## 11. Database Requirements

### 11.1 Collections Overview
1. Sellers
2. Listings
3. Enquiries
4. Favorites

### 11.2 Sellers Collection
| Field | Type | Required | Default | Validation / Notes |
|---|---|---|---|---|
| _id | ObjectId | auto | — | Primary key |
| name | String | yes | — | 2–80 chars |
| email | String | yes | — | valid email, lowercase |
| phone | String | no | — | optional contact |
| contactPreference | String | no | "email" | enum: email, phone, both |
| createdAt | Date | auto | now | timestamp |
| updatedAt | Date | auto | now | timestamp |

Indexes: unique email.

### 11.3 Listings Collection
| Field | Type | Required | Default | Validation / Notes |
|---|---|---|---|---|
| _id | ObjectId | auto | — | PK |
| name | String | yes | — | 3–100 chars |
| description | String | yes | — | 10–2000 chars |
| price | Number | yes | 0 | >=0; >0 if For Sale |
| category | String | yes | — | enum |
| condition | String | yes | — | enum |
| images | [String] | yes | — | 1–5 Cloudinary URLs |
| listingType | String | yes | — | enum |
| exchangeDescription | String | conditional | — | required if Exchange, 1–500 |
| status | String | yes | Available | enum |
| isActive | Boolean | yes | true | — |
| seller | ObjectId ref Seller | yes | — | valid ref |
| createdAt | Date | auto | now | — |
| updatedAt | Date | auto | now | — |

Indexes: text index on name+description; index on category, price, status, isActive, seller, createdAt.

### 11.4 Enquiries Collection
| Field | Type | Required | Default | Validation / Notes |
|---|---|---|---|---|
| _id | ObjectId | auto | — | PK |
| listing | ObjectId ref Listing | yes | — | valid ref |
| buyerName | String | yes | — | 2–80 chars |
| buyerEmail | String | yes | — | valid email |
| message | String | yes | — | 1–1000 chars |
| offerPrice | Number | no | — | >=0 if provided |
| status | String | yes | Pending | enum |
| sellerResponse | String | no | — | optional note |
| createdAt | Date | auto | now | — |
| updatedAt | Date | auto | now | — |

Indexes: index on listing, status, createdAt.

### 11.5 Favorites Collection
| Field | Type | Required | Default | Validation / Notes |
|---|---|---|---|---|
| _id | ObjectId | auto | — | PK |
| buyerId | String | yes | — | demo buyer identifier (email or id) |
| listing | ObjectId ref Listing | yes | — | valid ref |
| createdAt | Date | auto | now | — |

Indexes: unique compound (buyerId, listing).

### 11.6 Relationships
- Seller 1→N Listings
- Listing 1→N Enquiries
- Listing 1→N Favorites
- Buyer (demo id) 1→N Favorites

### 11.7 Recommendations
- Use ObjectId references.
- Enable timestamps.
- Unique constraints on seller email and (buyerId, listing).
- Text search index for relevance sorting.
- Compound indexes for common filter combos.
- Connection caching for serverless (Mongoose singleton).

---

## 12. API Requirements

Base URL: `/api`. All responses JSON. Standard error format: `{ success: false, message, errors? }`.

### 12.1 Listings
| ID | Method | Endpoint | Purpose |
|---|---|---|---|
| API-001 | GET | /api/listings | List marketplace listings (filters/sort/pagination) |
| API-002 | GET | /api/listings/:id | Get listing detail |
| API-003 | POST | /api/listings | Create listing |
| API-004 | PUT | /api/listings/:id | Update listing |
| API-005 | PATCH | /api/listings/:id/status | Update availability status |
| API-006 | PATCH | /api/listings/:id/deactivate | Deactivate listing |
| API-007 | DELETE | /api/listings/:id | Delete listing |
| API-008 | GET | /api/listings/:id/similar | Similar listings |

Query params for GET /api/listings: search, category, minPrice, maxPrice, condition, sort (newest|price_asc|price_desc|relevance), page, limit, sellerId, includeInactive (bool).

### 12.2 Sellers
| ID | Method | Endpoint | Purpose |
|---|---|---|---|
| API-010 | GET | /api/sellers/:id | Seller profile |
| API-011 | GET | /api/sellers/:id/listings | Seller's listings |
| API-012 | GET | /api/sellers/:id/dashboard | Dashboard metrics |
| API-013 | POST | /api/sellers | Create seller profile (demo) |

### 12.3 Enquiries
| ID | Method | Endpoint | Purpose |
|---|---|---|---|
| API-020 | GET | /api/enquiries | List enquiries (filter by seller/listing/buyer) |
| API-021 | GET | /api/enquiries/:id | Enquiry detail |
| API-022 | POST | /api/enquiries | Create enquiry |
| API-023 | PATCH | /api/enquiries/:id/accept | Accept enquiry/offer |
| API-024 | PATCH | /api/enquiries/:id/reject | Reject enquiry/offer |
| API-025 | PATCH | /api/enquiries/:id/close | Close enquiry |

### 12.4 Favorites
| ID | Method | Endpoint | Purpose |
|---|---|---|---|
| API-030 | GET | /api/favorites | List favorites for buyer |
| API-031 | POST | /api/favorites | Add favorite |
| API-032 | DELETE | /api/favorites/:id | Remove favorite |
| API-033 | GET | /api/favorites/check | Check if favorited |

### 12.5 Misc
| ID | Method | Endpoint | Purpose |
|---|---|---|---|
| API-040 | GET | /api/health | Health check |

Each endpoint shall document request body, success response (200/201), and error responses (400, 404, 409, 500) with validation messages.

---

## 13. UI/UX Requirements

Screens:
1. Homepage – hero, featured listings, categories, CTA.
2. Marketplace page – grid of listings, filters sidebar, search, sort, pagination.
3. Product details page – images, details, seller card, similar listings, enquiry form, favorite toggle.
4. Create listing page – multi-field form with image upload.
5. Edit listing page – pre-filled form.
6. Seller profile page – seller info, active listings, history.
7. Favorites page – saved listings grid.
8. Seller dashboard – metrics cards, listing management table, enquiry list.
9. Enquiries management page – received enquiries with accept/reject.
10. Responsive mobile layouts – all screens mobile-first.

UI principles: modern, minimal, professional, responsive, accessible (semantic HTML, alt text, keyboard nav, contrast), Tailwind CSS, Lucide icons.

---

## 14. Non-Functional Requirements

- NFR-001 Performance: Initial page load < 3s on 3G; API responses < 500ms p95.
- NFR-002 Responsive: Mobile-first, breakpoints sm/md/lg/xl.
- NFR-003 Accessibility: WCAG 2.1 AA basics; semantic elements; alt text; focus states.
- NFR-004 Server-side validation: All inputs validated on server regardless of client.
- NFR-005 Error handling: Graceful errors, user-friendly messages, no stack traces in prod.
- NFR-006 Data consistency: Valid references; safe deletes.
- NFR-007 DB connection: Cached connection for serverless.
- NFR-008 Secrets: Env vars only; never client-exposed.
- NFR-009 Image optimization: Cloudinary transformations; Next Image.
- NFR-010 SEO: Metadata, Open Graph, sitemap optional.
- NFR-011 Maintainability: Reusable components, clear folder structure.
- NFR-012 Deployment: Vercel with env vars configured.

---

## 15. Edge Cases

- EC-001: Listing deleted while in favorites → remove favorite or show "unavailable".
- EC-002: Listing sold while enquiry pending → mark enquiry Closed.
- EC-003: Duplicate favorite submission → return existing, no duplicate.
- EC-004: Invalid ObjectId → 400/404.
- EC-005: Offer negative → 400 validation error.
- EC-006: Free listing with price > 0 → normalize to 0 or reject.
- EC-007: Exchange listing missing description → 400.
- EC-008: Image upload failure → listing not created; error returned.
- EC-009: Concurrent accept/reject → atomic update with status check.
- EC-010: Deactivated listing accessed directly → 404 or "unavailable" state.
- EC-011: Empty marketplace → empty state with CTA.
- EC-012: No search results → empty state with suggestions.

---

## 16. Scope and Restrictions

In scope: Modules 1–6, REST APIs, MongoDB, Cloudinary images, responsive UI, dashboard, favorites, enquiries.

Out of scope (mandatory): Authentication, authorization, payments, real-time chat, live messaging, complex admin permissions.

Restrictions: JavaScript only (no TS); App Router; no separate Express backend; Mongoose not Prisma; no auth.

---

## 17. Optional Enhancements

- Email notifications for enquiries.
- Admin/demo moderation UI.
- Reviews/ratings for sellers.
- Map-based location filtering.
- Image carousel improvements.
- Pagination/infinite scroll.

---

## 18. Development Roadmap

| Phase | Objectives | Key Features | Expected Files | Dependencies | Deliverables | Completion Criteria |
|---|---|---|---|---|---|---|
| 0 | PRD | Documentation | docs/PRD.md | — | PRD | Approved |
| 1 | Init & architecture | Next.js setup, folders, config | package.json, next.config.js, jsconfig | — | Runnable app | Dev server runs |
| 2 | UI design system | Tailwind, components, layout | components/*, app/layout.js | Phase 1 | Design system | Components reusable |
| 3 | Homepage & marketplace | Home, marketplace UI | app/page.js, app/marketplace/page.js | Phase 2 | Static UI | Responsive |
| 4 | Listing & details | Create/edit/detail pages | app/listings/* | Phase 3 | Forms | Validation works |
| 5 | DB & models | Mongo connection, Mongoose models | lib/db.js, models/* | Phase 1 | Models | CRUD via shell |
| 6 | Backend APIs | Route handlers | app/api/* | Phase 5 | APIs | Postman tests pass |
| 7 | Profiles & enquiries | Seller profile, enquiry flows | app/sellers/*, app/enquiries/* | Phase 6 | Workflows | E2E manual |
| 8 | Favorites & dashboard | Favorites, dashboard | app/favorites/*, app/dashboard/* | Phase 6 | Features | Metrics correct |
| 9 | Integration | Connect UI to APIs | fetch utilities | Phases 4,6,7,8 | Integrated app | No mock data |
| 10 | Testing & bug fixing | Validation, edge cases | tests (optional) | Phase 9 | Stable app | Lint/typecheck |
| 11 | Docs & deploy | README, Vercel | README.md | Phase 10 | Deployed | Live URL |

---

## 19. Acceptance Criteria

- AC-001: All six modules functional end-to-end.
- AC-002: Listings CRUD works with validation.
- AC-003: Discovery search/filter/sort works.
- AC-004: Enquiry workflow accept/reject once.
- AC-005: Favorites no duplicates.
- AC-006: Dashboard metrics accurate.
- AC-007: Responsive on mobile.
- AC-008: No auth required.
- AC-009: Secrets not exposed.
- AC-010: Deployed on Vercel.

---

## 20. Final Evaluation Checklist

- [ ] PRD present in docs/PRD.md
- [ ] Modules 1–6 implemented
- [ ] MongoDB collections created
- [ ] REST APIs documented and working
- [ ] UI responsive
- [ ] Validation on server
- [ ] Edge cases handled
- [ ] Deployed

---

### Unresolved Assumptions
- Demo buyer identity: assumed a simple buyer ID/email input (no auth). To be confirmed.
- Image upload: assumed direct Cloudinary upload via API route; client may use unsigned preset optionally.
- Pagination default limit: 12.
- Similar listings: by category, excluding current.

---

### Confirmation
No application code was generated in Phase 0. Only `docs/PRD.md` was created. Awaiting approval before Phase 1.
