import { SITE } from "@/config/site";
import { getSitemapListings } from "@/lib/data";

const STATIC_ROUTES = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/marketplace", changeFrequency: "daily", priority: 0.9 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
];

export default async function sitemap() {
  const listings = await getSitemapListings();

  return [
    ...STATIC_ROUTES.map((route) => ({
      url: `${SITE.url}${route.path}`,
      lastModified: new Date(),
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...listings.map((listing) => ({
      url: `${SITE.url}/product/${listing.id}`,
      lastModified: listing.updatedAt ? new Date(listing.updatedAt) : new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    })),
  ];
}
