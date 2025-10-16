// utils/url.ts
export function fixImageUrl(url: string): string {
  if (!url) return url;

  // Convert protocol-relative URLs to absolute URLs
  if (url.startsWith('//')) {
    return `https:${url}`;
  }

  // Ensure the URL has a protocol
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }

  return url;
}