import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const query = url.search;
  const redirectTo = new URL(`/auth/callback${query}`, url.origin);
  return NextResponse.redirect(redirectTo);
}
