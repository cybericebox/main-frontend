import { RETENTION } from "@/legal/retention"

// The published retention periods of the Privacy Policy (see src/legal/retention.ts), static at a stable URL.
export const dynamic = "force-static"

export function GET(): Response {
  return Response.json(RETENTION)
}
