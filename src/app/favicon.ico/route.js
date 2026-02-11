export async function GET(request) {
  // Many browsers still request /favicon.ico explicitly.
  // Redirect to the SVG favicon we ship in /public.
  return Response.redirect(new URL('/icon.svg', request.url), 308);
}
