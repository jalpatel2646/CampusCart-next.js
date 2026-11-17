import { Navbar } from "@/components/layout/Navbar";
import { getSessionSeller } from "@/lib/session";
import { serializeSeller } from "@/lib/serializers";

/** Reads the session on the server so the navbar can show the signed-in account. */
export async function SiteHeader() {
  const seller = await getSessionSeller();
  return <Navbar user={serializeSeller(seller)} />;
}

export default SiteHeader;
