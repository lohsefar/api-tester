import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * API endpoint to get the server's local IP address
 * Useful for development when you want to use your local IP instead of localhost
 */
export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_WEBHOOK_BASE_URL;
  
  if (baseUrl) {
    return NextResponse.json({ baseUrl });
  }

  // Try to get local IP address
  const os = await import("os");
  const networkInterfaces = os.networkInterfaces();
  
  // Find the first non-internal IPv4 address
  for (const interfaceName of Object.keys(networkInterfaces)) {
    const addresses = networkInterfaces[interfaceName];
    if (!addresses) continue;
    
    for (const addr of addresses) {
      if (addr.family === "IPv4" && !addr.internal) {
        const port = process.env.PORT || "3000";
        return NextResponse.json({ 
          baseUrl: `http://${addr.address}:${port}`,
          suggested: `http://${addr.address}:${port}`
        });
      }
    }
  }

  // Fallback to localhost
  const port = process.env.PORT || "3000";
  return NextResponse.json({ 
    baseUrl: `http://localhost:${port}`,
    suggested: null
  });
}

