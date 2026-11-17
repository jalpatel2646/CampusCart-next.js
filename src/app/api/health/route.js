import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
  const startedAt = Date.now();

  try {
    const mongoose = await connectToDatabase();
    await mongoose.connection.db.admin().ping();

    return Response.json(
      {
        success: true,
        message: "CampusCart API is running",
        service: "CampusCart",
        database: "connected",
        latencyMs: Date.now() - startedAt,
        timestamp: new Date().toISOString(),
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("[CampusCart health]", error);
    return Response.json(
      {
        success: false,
        message: "CampusCart API is running, but the database is unreachable",
        service: "CampusCart",
        database: "unavailable",
        timestamp: new Date().toISOString(),
      },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
