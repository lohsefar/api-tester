/**
 * Get the base URL for webhook endpoints
 * Uses NEXT_PUBLIC_WEBHOOK_BASE_URL if set, otherwise falls back to window.location.origin
 */
export function getWebhookBaseUrl(): string {
  // In server-side context, return empty string (will be set client-side)
  if (typeof window === "undefined") {
    return "";
  }

  // Use environment variable if set (must be prefixed with NEXT_PUBLIC_ to be available client-side)
  const baseUrl = process.env.NEXT_PUBLIC_WEBHOOK_BASE_URL;
  
  if (baseUrl && baseUrl.trim()) {
    let url = baseUrl.trim();
    
    // Remove trailing slash if present
    url = url.replace(/\/$/, "");
    
    // Add protocol if missing
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      // Default to http for local IPs, https for domains
      if (url.match(/^\d+\.\d+\.\d+\.\d+/) || url.includes("localhost")) {
        url = `http://${url}`;
      } else {
        url = `https://${url}`;
      }
    }
    
    return url;
  }

  // Fallback to current origin
  return window.location.origin;
}

/**
 * Construct full webhook URL from slug
 */
export function getWebhookUrl(slug: string): string {
  const baseUrl = getWebhookBaseUrl();
  return `${baseUrl}/api/webhook/${slug}`;
}

