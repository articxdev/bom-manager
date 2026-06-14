import { getProducts } from "@/app/actions/products";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search") || undefined;

  const result = await getProducts(search);
  return NextResponse.json(result);
}
