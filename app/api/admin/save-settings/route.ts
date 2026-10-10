import { POST as handleSettingsPost } from "../settings/route";

export async function POST(request: Request) {
  return handleSettingsPost(request);
}
