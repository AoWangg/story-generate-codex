export function getSiteUrl() {
  let url =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_VERCEL_URL ||
    process.env.VERCEL_URL ||
    "";

  if (!url && typeof window !== "undefined") {
    url = window.location.origin;
  }

  if (!url) {
    url = "http://localhost:3000";
  }

  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  if (url.endsWith("/")) {
    url = url.slice(0, -1);
  }

  return url;
}

