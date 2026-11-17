import { Navbar } from "@/components/layout/Navbar";
import { getSessionSeller } from "@/lib/session";
import { serializeSeller } from "@/lib/serializers";
import { getUnreadNotificationsData } from "@/lib/data";

/** Reads the session on the server so the navbar can show the signed-in account. */
export async function SiteHeader() {
  const seller = await getSessionSeller();
  const unread = seller?._id ? await getUnreadNotificationsData(String(seller._id)) : 0;
  return <Navbar user={serializeSeller(seller)} unread={unread} />;
}

export default SiteHeader;
