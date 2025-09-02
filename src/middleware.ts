import { NextRequest, NextResponse } from "next/server";
import { jwtVerify, JWTPayload } from "jose";
import { UserRole } from "./types/user.type";
import { HttpStatusCode } from "axios";

const AUTH_COOKIE = "accessToken"; // name of your cookie
const SECRET = new TextEncoder().encode(process.env.SECRET_KEY); // HS256 shared secret
console.log({ SECRET });

function isPublic(req: NextRequest) {
  const { pathname } = req.nextUrl;
  return (
    pathname.startsWith("/api/db/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/robots.txt") ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|css|js|txt|webp|woff2?)$/) !==
      null
  );
}

function ceoRoute(req: NextRequest) {
  const { pathname } = req.nextUrl;
  return pathname.startsWith("/approvals");
}

function tokenFromAuthHeader(req: NextRequest) {
  const auth = req.headers.get("authorization") ?? "";
  if (!auth) return null;
  const [scheme, value] = auth.split(" ");
  if (scheme?.toLowerCase() === "bearer" && value) return value;
  return null;
}

async function verifyJWT(token: string) {
  // If you use RS256/ES256, switch to a JWKS here with createRemoteJWKSet()
  const { payload } = await jwtVerify(token, SECRET, {
    // issuer: "your-issuer",
    // audience: "your-audience",
  });
  return payload as JWTPayload & { role?: string; email?: string };
}

function unauthorized(req: NextRequest) {
  const isApi = req.nextUrl.pathname.startsWith("/api");
  if (isApi) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const loginUrl = new URL("/", req.url);
  loginUrl.searchParams.set("next", req.nextUrl.pathname + req.nextUrl.search);
  return NextResponse.redirect(loginUrl);
}

export default async function middleware(req: NextRequest) {
  if (req.method === "OPTIONS") return NextResponse.next();
  if (isPublic(req)) return NextResponse.next();

  // Prefer cookie (works for SSR/page navigations), fall back to Authorization header
  const cookieToken = req.cookies.get(AUTH_COOKIE)?.value ?? null;
  //   const headerToken = tokenFromAuthHeader(req);
  const token = cookieToken;

  if (!token) return unauthorized(req);

  try {
    const payload = await verifyJWT(token);
    const role = payload.role;

    const isCeoRoute = ceoRoute(req);

    if (isCeoRoute && role !== UserRole.CEO)
      return NextResponse.json(
        { message: "User is  not allowed here" },
        { status: HttpStatusCode.Forbidden }
      );

    // Forward claims to the request so pages / API routes can use them
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user-id", String(payload.sub ?? ""));
    if (payload.role) requestHeaders.set("x-user-role", String(payload.role));
    requestHeaders.set("x-user-payload", JSON.stringify(payload));

    const res = NextResponse.next({ request: { headers: requestHeaders } });

    // Optional: refresh cookie expiry on activity (sliding session)
    if (cookieToken) {
      res.cookies.set(AUTH_COOKIE, token, {
        httpOnly: true,
        // secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        // maxAge: 60 * 60, // e.g. 1h
      });
    }

    return res;
  } catch (err) {
    const res = unauthorized(req);
    res.cookies.delete(AUTH_COOKIE);
    return res;
  }
}

// Protect everything except public/static assets.
// Adjust or narrow as you prefer (e.g., add "/approvals/:path*", "/api/:path*", etc.)
export const config = {
  matcher: [
    "/approvals/:path*",
    "/api/db/accounts/:path*",
    "/api/db/customers/:path*",
  ],
};
