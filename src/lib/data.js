import { cacheLife, cacheTag } from "next/cache";
import { connectToDatabase } from "@/lib/mongodb";
import { ServiceError } from "@/lib/errors";
import { LISTINGS_TAG, SELLERS_TAG } from "@/lib/cache-tags";
import {
  getListingById as getListingByIdService,
  getListings,
  getSimilarListings,
} from "@/services/listing.service";
import {
  getSellerById,
  getSellerDashboard,
  getSellerListings,
} from "@/services/seller.service";
import { getFavorites, isFavorite } from "@/services/favorite.service";
import { getEnquiries } from "@/services/enquiry.service";
import { getUnreadNotificationCount } from "@/services/notification.service";
import { listSavedSearches } from "@/services/saved-search.service";
import Listing from "@/models/listing";
import {
  serializeEnquiry,
  serializeFavorite,
  serializeListing,
  serializeSavedSearch,
  serializeSeller,
} from "@/lib/serializers";

function isMissing(error) {
  return (
    error instanceof ServiceError &&
    (error.statusCode === 404 || error.statusCode === 400)
  );
}

async function categoryCounts() {
  await connectToDatabase();
  const rows = await Listing.aggregate([
    { $match: { isActive: true, status: { $ne: "Sold" } } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
  ]);

  return rows.reduce((counts, row) => {
    counts[row._id] = row.count;
    return counts;
  }, {});
}

/** Per-pickup-location counts, excluding empty locations. */
async function locationCounts() {
  await connectToDatabase();
  const rows = await Listing.aggregate([
    { $match: { isActive: true, status: { $ne: "Sold" }, location: { $ne: "", $exists: true } } },
    { $group: { _id: "$location", count: { $sum: 1 } } },
  ]);

  return rows.reduce((counts, row) => {
    counts[row._id] = row.count;
    return counts;
  }, {});
}

/** Marketplace result set plus per-category counts. */
export async function getMarketplaceData(filters = {}) {
  "use cache";
  cacheLife("minutes");
  cacheTag(LISTINGS_TAG);

  const [result, counts, locations] = await Promise.all([
    getListings({
      search: filters.search,
      categories: filters.categories,
      conditions: filters.conditions,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      location: filters.location,
      sort: filters.sort,
      page: filters.page,
      limit: filters.limit,
    }),
    categoryCounts(),
    locationCounts(),
  ]);

  return {
    ...result,
    items: result.items.map(serializeListing),
    categoryCounts: counts,
    locationCounts: locations,
  };
}

/** Home page snapshot: newest listings, free/swap picks, and honest counts. */
export async function getHomeData(featuredLimit = 8) {
  "use cache";
  cacheLife("minutes");
  cacheTag(LISTINGS_TAG);

  await connectToDatabase();

  const [latest, freeAndSwap, totals, counts] = await Promise.all([
    getListings({ sort: "newest", page: 1, limit: featuredLimit }),
    getListings({
      listingTypes: ["Free", "Exchange"],
      sort: "newest",
      page: 1,
      limit: 2,
    }),
    Listing.aggregate([
      { $match: { isActive: true, status: { $ne: "Sold" } } },
      {
        $group: {
          _id: null,
          liveCount: { $sum: 1 },
          freeCount: {
            $sum: { $cond: [{ $ne: ["$listingType", "For Sale"] }, 1, 0] },
          },
          sellers: { $addToSet: "$seller" },
        },
      },
      {
        $project: {
          _id: 0,
          liveCount: 1,
          freeCount: 1,
          sellerCount: { $size: "$sellers" },
        },
      },
    ]),
    categoryCounts(),
  ]);

  const stats = totals[0] ?? { liveCount: 0, freeCount: 0, sellerCount: 0 };

  return {
    featured: latest.items.map(serializeListing),
    freeAndSwap: freeAndSwap.items.map(serializeListing),
    categoryCounts: counts,
    stats,
  };
}

/** Listing detail with similar listings, or null for invalid/missing ids. */
export async function getListingDetail(id) {
  "use cache";
  cacheLife("minutes");
  cacheTag(LISTINGS_TAG);

  try {
    const listing = await getListingByIdService(id);
    if (!listing.isActive) return null;

    const similar = await getSimilarListings(id, { limit: 3 });

    return {
      listing: serializeListing(listing),
      similar: similar.map(serializeListing),
    };
  } catch (error) {
    if (isMissing(error)) return null;
    throw error;
  }
}

/** Public seller profile with current listings and history. */
export async function getSellerProfile(id) {
  "use cache";
  cacheLife("minutes");
  cacheTag(SELLERS_TAG, LISTINGS_TAG);

  try {
    const [seller, listings] = await Promise.all([
      getSellerById(id),
      getSellerListings(id, { includeInactive: true, limit: 50 }),
    ]);

    const items = listings.items.map(serializeListing);
    const activeListings = items.filter(
      (listing) => listing.isActive && listing.status !== "Sold"
    );
    const history = items.filter(
      (listing) => !listing.isActive || listing.status === "Sold"
    );

    return {
      seller: serializeSeller(seller),
      activeListings,
      history,
    };
  } catch (error) {
    if (isMissing(error)) return null;
    throw error;
  }
}

/**
 * Seller-specific dashboard snapshot. This reads the signed-in session upstream,
 * so it is intentionally not cached and must render inside a Suspense boundary.
 */
export async function getDashboardData(sellerId) {
  const { seller, listings, enquiries, metrics } = await getSellerDashboard(sellerId);

  return {
    seller: serializeSeller(seller),
    listings: listings.map(serializeListing),
    enquiries: enquiries.map(serializeEnquiry),
    metrics,
  };
}

/** Favourites for the signed-in account. Request-time data. */
export async function getFavoritesData(buyerId) {
  if (!buyerId) {
    return { items: [], total: 0, page: 1, totalPages: 1 };
  }

  const result = await getFavorites(buyerId, { limit: 100 });
  return {
    ...result,
    items: result.items.map(serializeFavorite),
  };
}

/**
 * Saved searches for the signed-in account. Each item includes live match and
 * new-match counts, measured against the listing query contract.
 */
export async function getSavedSearchesData(sellerId) {
  if (!sellerId) return [];

  const items = await listSavedSearches(sellerId);
  return items.map((item) => serializeSavedSearch(item));
}

/** Whether the signed-in account has saved a listing. Request-time data. */
export async function getFavoriteStatus(buyerId, listingId) {
  if (!buyerId) return false;

  try {
    return await isFavorite(buyerId, listingId);
  } catch (error) {
    if (isMissing(error)) return false;
    throw error;
  }
}

/** Outgoing enquiries for the signed-in account (buyer inbox). */
export async function getBuyerEnquiriesData(accountId, { limit = 50 } = {}) {
  if (!accountId) return { items: [], total: 0, page: 1, totalPages: 1 };

  const result = await getEnquiries({ buyerId: accountId, limit });
  return {
    ...result,
    items: result.items.map(serializeEnquiry),
  };
}

/** Unread notification count for the navbar badge. */
export async function getUnreadNotificationsData(accountId) {
  if (!accountId) return 0;
  return getUnreadNotificationCount(accountId);
}

/** URLs for the sitemap; only public, active listings are exposed. */
export async function getSitemapListings() {
  "use cache";
  cacheLife("hours");
  cacheTag(LISTINGS_TAG);

  await connectToDatabase();
  const items = await Listing.find({ isActive: true, status: { $ne: "Sold" } })
    .select("_id updatedAt")
    .sort({ createdAt: -1 })
    .limit(5000)
    .lean();

  return items.map((item) => ({
    id: String(item._id),
    updatedAt: item.updatedAt ? new Date(item.updatedAt).toISOString() : null,
  }));
}
