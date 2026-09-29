// Role labels: one canonical name per role, the same in every app (keys role.* in messages).
import { t } from "@/i18n/t"
import { eventRoleKey, roleKey } from "./roleKeys"

export { EVENT_ROLES, PLATFORM_ROLES, type EventRoleCode, type PlatformRole } from "./roleKeys"

/** Label of a platform role; an unknown role shows as is. */
export function roleLabel(role: string): string {
  const key = roleKey(role)
  return key ? t(key) : role
}

/** Label of an event management role by its code; an unknown code shows as is. */
export function eventRoleLabel(code: number): string {
  const key = eventRoleKey(code)
  return key ? t(key) : String(code)
}
