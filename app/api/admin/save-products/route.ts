import { POST as handleProductsPost } from "../products/route";

export async function POST(request: Request) {
  return handleProductsPost(request);
}
