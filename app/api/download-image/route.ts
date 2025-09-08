export const runtime = "edge";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get('url');
    if (!url) {
      return new Response('Missing url', { status: 400 });
    }

    // Basic validation: only allow http/https
    if (!/^https?:\/\//i.test(url)) {
      return new Response('Invalid url', { status: 400 });
    }

    const resp = await fetch(url);
    if (!resp.ok) {
      return new Response('Failed to fetch image', { status: 502 });
    }

    // Stream bytes back with a download header
    const contentType = resp.headers.get('content-type') || 'application/octet-stream';
    const filename = `story-image-${Date.now()}` + (contentType.includes('png') ? '.png' : contentType.includes('jpeg') ? '.jpg' : '');

    return new Response(resp.body, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (e) {
    return new Response('Error downloading image', { status: 500 });
  }
}

