import { NextRequest, NextResponse } from "next/server";
import { jwtVerify, JWTPayload } from "jose";
import { UserRole } from "./types/user.type";
import { HttpStatusCode } from "axios";

const AUTH_COOKIE = "accessToken";
const SECRET = new TextEncoder().encode(process.env.SECRET_KEY);

// Public routes that don't require auth
function isPublic(req: NextRequest) {
  const { pathname } = req.nextUrl;
  return (
    pathname.startsWith("/api/db/auth") || // your auth endpoints
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/robots.txt") ||
    /\.(png|jpg|jpeg|gif|svg|ico|css|js|txt|webp|woff2?)$/.test(pathname)
  );
}

// Example: CEO-only section
function isCeoRoute(req: NextRequest) {
  return req.nextUrl.pathname.startsWith("/approvals");
}

function isApi(req: NextRequest) {
  return req.nextUrl.pathname.startsWith("/api");
}

function redirectToLogin(req: NextRequest, reason?: string) {
  const loginUrl = new URL("/", req.url); // your login path
  loginUrl.searchParams.set("next", req.nextUrl.pathname + req.nextUrl.search);
  if (reason) loginUrl.searchParams.set("reason", reason);
  return NextResponse.redirect(loginUrl);
}

async function verifyJWT(token: string) {
  // NOTE: jwtVerify automatically enforces `exp` and `nbf` if present.
  // You can additionally enforce a max age even if `exp` is missing:
  const { payload } = await jwtVerify(token, SECRET, {
    // issuer: process.env.JWT_ISSUER,
    // audience: process.env.JWT_AUDIENCE,
    // maxTokenAge: "1h", // optional backstop if you want to bound token lifetime
    // clockTolerance: "2s" // optional skew tolerance
  });
  return payload as JWTPayload & {
    role?: string;
    email?: string;
    userId?: string;
  };
}

export default async function middleware(req: NextRequest) {
  if (req.method === "OPTIONS") return NextResponse.next();
  if (isPublic(req)) return NextResponse.next();

  const token = req.cookies.get(AUTH_COOKIE)?.value ?? null;
  if (!token) {
    // no token at all -> go to login / return 401
    return isApi(req)
      ? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      : redirectToLogin(req, "missing");
  }

  try {
    const payload = await verifyJWT(token);
    const role = payload.role as UserRole | undefined;

    // Example authorization check for CEO-only section
    if (isCeoRoute(req) && role !== UserRole.CEO) {
      return NextResponse.json(
        { message: "User is not allowed here" },
        { status: HttpStatusCode.Forbidden }
      );
    }

    // Forward claims
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set(
      "x-user-id",
      String(payload.sub ?? payload.userId ?? "")
    );
    if (payload.role) requestHeaders.set("x-user-role", String(payload.role));
    requestHeaders.set("x-user-payload", JSON.stringify(payload));

    const res = NextResponse.next({ request: { headers: requestHeaders } });

    // (Optional) Sliding cookie expiry (NOTE: this does NOT extend a JWT's exp)
    // If you want the cookie to expire later, set maxAge; but if JWT is expired,
    // jwtVerify will still fail on next request.
    res.cookies.set(AUTH_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      // secure: process.env.NODE_ENV === "production",
      // maxAge: 60 * 60, // example 1h
    });

    return res;
  } catch (err: any) {
    // Distinguish *expired* tokens from other failures.
    // jose throws an error named "JWTExpired" when exp < now.
    const name = err?.name || err?.code;
    const expired =
      name === "JWTExpired" ||
      name === "ERR_JWT_EXPIRED" ||
      /exp/i.test(String(err?.message));

    const res = isApi(req)
      ? NextResponse.json(
          { error: expired ? "TokenExpired" : "Unauthorized" },
          { status: 401 }
        )
      : redirectToLogin(req, expired ? "expired" : "invalid");

    res.cookies.delete(AUTH_COOKIE);
    return res;
  }
}

export const config = {
  matcher: [
    "/approvals/:path*",
    "/api/db/accounts/:path*",
    "/api/db/customers/:path*",
    // add more protected areas or simply: "/api/:path*", "/(?!_next|favicon\\.ico).*"
  ],
};
