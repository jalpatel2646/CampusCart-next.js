# CampusCart

CampusCart is a student-focused second-hand marketplace for buying, selling, giving away, and exchanging second-hand products.

## Technology Stack

- Next.js (App Router)
- JavaScript
- React
- Tailwind CSS
- MongoDB Atlas
- Mongoose
- React Hook Form
- Zod
- Lucide React
- Cloudinary

## Prerequisites

- Node.js (LTS, meeting Next.js requirements)
- npm
- MongoDB Atlas connection string
- Cloudinary account (optional for image uploads)

## Installation

`ash
npm install
`

## Environment Variables

Copy .env.example to .env.local and fill in values:

`ash
cp .env.example .env.local
`

Required variables:

- NEXT_PUBLIC_APP_URL
- MONGODB_URI
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET

## Development

`ash
npm run dev
`

Open http://localhost:3000

## Build and Start

`ash
npm run build
npm run start
`

## Lint

`ash
npm run lint
`

## Project Status

Phase 1 complete: project initialization, folder architecture, base configuration, and health endpoint.

See docs/PRD.md for the full product requirements.
