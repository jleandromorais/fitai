import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/login", "/register"];

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;
  const isPublic = PUBLIC_ROUTES.some(r => pathname.startsWith(r));

  // Autenticado a tentar aceder ao login → manda para o dashboard
  if (token && isPublic) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Não autenticado a tentar aceder a rota protegida → manda para login
  if (!token && !isPublic) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)",],
};
