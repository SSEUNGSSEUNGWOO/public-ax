const ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

interface UnsplashPhoto {
  id: string;
  urls: {
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string | null;
}

export async function fetchUnsplashPhoto(query: string): Promise<string | null> {
  if (!ACCESS_KEY) return null;
  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&orientation=landscape&content_filter=high&per_page=1`,
      {
        headers: { Authorization: `Client-ID ${ACCESS_KEY}` },
        next: { revalidate: 86400 },
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.results?.[0]?.urls?.regular ?? null;
  } catch {
    return null;
  }
}

export async function fetchUnsplashPhotos(
  queries: string[]
): Promise<(string | null)[]> {
  return Promise.all(queries.map((q) => fetchUnsplashPhoto(q)));
}
