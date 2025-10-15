export default function sitemap() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || '';
  return [
    { url: `${base}/`, lastModified: new Date() },
    { url: `${base}/wallet`, lastModified: new Date() },
  ];
}

