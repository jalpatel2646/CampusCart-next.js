export async function GET() {
  return Response.json({
    success: true,
    message: "CampusCart API is running",
    service: "CampusCart",
  });
}
