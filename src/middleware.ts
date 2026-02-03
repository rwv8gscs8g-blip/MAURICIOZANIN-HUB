import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET_KEY = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
const isProd = process.env.NODE_ENV === "production";
if (!SECRET_KEY && isProd) {
  // Fail-closed: sem secret, nenhuma sessão será válida em produção.
  console.error("[middleware] AUTH_SECRET/NEXTAUTH_SECRET ausente em produção");
}
const key = new TextEncoder().encode(
  SECRET_KEY || (isProd ? "invalid-prod-secret" : `dev-temp-${process.env.NODE_ENV || "development"}`)
);

type SessionPayload = {
  user?: { id: string; role: string; clientAccessApproved?: boolean };
};

async function getSession(request: NextRequest): Promise<SessionPayload | null> {
  const token = request.cookies.get("session")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

const gates = [
  {
    prefix: "/dashboard",
    roles: ["ADMIN", "SUPERCONSULTOR", "CONSULTOR", "MUNICIPIO", "CLIENTE"],
  },
  { prefix: "/agenda", roles: ["ADMIN", "SUPERCONSULTOR", "CONSULTOR", "MUNICIPIO", "CLIENTE", "AGENDA"] },
  { prefix: "/admin", roles: ["ADMIN"] },
  { prefix: "/api/admin", roles: ["ADMIN"] },
  { prefix: "/api/classrooms", roles: ["ADMIN", "SUPERCONSULTOR", "CONSULTOR"] },
  { prefix: "/sala", roles: ["ADMIN", "SUPERCONSULTOR", "CONSULTOR"] },
  {
    prefix: "/produtos",
    roles: ["ADMIN", "SUPERCONSULTOR", "CONSULTOR", "MUNICIPIO", "CLIENTE"],
    matchContains: "/atestados",
  },
  {
    prefix: "/clientes",
    roles: ["ADMIN", "SUPERCONSULTOR", "CONSULTOR", "MUNICIPIO", "CLIENTE"],
  },
];

const isPublicPath = (pathname: string) => {
  if (pathname.startsWith("/auth")) return true;
  if (pathname.startsWith("/api/auth")) return true;
  if (pathname.startsWith("/api/classrooms/join")) return true;
  if (pathname.startsWith("/sala/entrar")) return true;
  if (pathname.startsWith("/ajuda")) return true;
  if (pathname.startsWith("/_next")) return true;
  if (pathname.startsWith("/favicon")) return true;
  if (pathname.startsWith("/images")) return true;
  if (pathname.startsWith("/resources")) return true;
  if (pathname.startsWith("/uploads")) return true;
  const publicPrefixes = [
    "/",
    "/sobre",
    "/compartilhe",
    "/produtos",
    "/inovajuntos",
    "/clientes",
    "/publicacoes",
    "/midia",
    "/api/timeline",
    "/api/publicacoes",
    "/api/midia",
    "/api/clients/public",
  ];
  return publicPrefixes.some((prefix) =>
    prefix === "/" ? pathname === "/" : pathname.startsWith(prefix)
  );
};

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (isPublicPath(pathname)) return NextResponse.next();

  const gate = gates.find((item) => {
    if (!pathname.startsWith(item.prefix)) return false;
    if ("matchContains" in item && item.matchContains && !pathname.includes(item.matchContains)) {
      return false;
    }
    return true;
  });

  if (!gate) {
    const session = await getSession(request);
    if (!session?.user) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("next", `${pathname}${search}`);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  const session = await getSession(request);
  if (!session?.user) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (gate.roles.length > 0 && !gate.roles.includes(session.user.role)) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("denied", "1");
    return NextResponse.redirect(loginUrl);
  }

  if (
    pathname.startsWith("/clientes") &&
    session.user.role === "CLIENTE" &&
    session.user.clientAccessApproved === false
  ) {
    const dashboardUrl = new URL("/dashboard", request.url);
    dashboardUrl.searchParams.set("pending", "1");
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};
