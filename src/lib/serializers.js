function toIsoString(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function serializeSeller(seller) {
  if (!seller) return null;

  if (typeof seller === "string") return { _id: seller };
  if (seller._id === undefined && seller.id !== undefined) {
    return {
      _id: String(seller.id),
      name: seller.name ?? "",
      email: seller.email ?? "",
      phone: seller.phone ?? "",
      contactPreference: seller.contactPreference ?? "email",
    };
  }

  return {
    _id: String(seller._id),
    name: seller.name ?? "",
    email: seller.email ?? "",
    phone: seller.phone ?? "",
    contactPreference: seller.contactPreference ?? "email",
    createdAt: toIsoString(seller.createdAt),
  };
}

export function serializeListing(listing) {
  if (!listing) return null;
  const source = typeof listing.toObject === "function" ? listing.toObject() : listing;

  return {
    _id: String(source._id),
    name: source.name ?? "",
    description: source.description ?? "",
    price: Number(source.price ?? 0),
    category: source.category ?? "Other",
    condition: source.condition ?? "Used",
    images: Array.isArray(source.images) ? source.images.filter(Boolean) : [],
    listingType: source.listingType ?? "For Sale",
    exchangeDescription: source.exchangeDescription ?? "",
    status: source.status ?? "Available",
    isActive: source.isActive !== false,
    seller: serializeSeller(source.seller),
    createdAt: toIsoString(source.createdAt),
    updatedAt: toIsoString(source.updatedAt),
  };
}

export function serializeEnquiry(enquiry) {
  if (!enquiry) return null;
  const source = typeof enquiry.toObject === "function" ? enquiry.toObject() : enquiry;

  return {
    _id: String(source._id),
    listing: source.listing ? serializeListing(source.listing) : null,
    buyerName: source.buyerName ?? "",
    buyerEmail: source.buyerEmail ?? "",
    message: source.message ?? "",
    offerPrice:
      source.offerPrice === undefined || source.offerPrice === null
        ? null
        : Number(source.offerPrice),
    status: source.status ?? "Pending",
    sellerResponse: source.sellerResponse ?? "",
    createdAt: toIsoString(source.createdAt),
    updatedAt: toIsoString(source.updatedAt),
  };
}

export function serializeFavorite(favorite) {
  if (!favorite) return null;
  const source = typeof favorite.toObject === "function" ? favorite.toObject() : favorite;

  return {
    _id: String(source._id),
    buyerId: source.buyerId ?? "",
    listing: source.listing ? serializeListing(source.listing) : null,
    createdAt: toIsoString(source.createdAt),
  };
}
