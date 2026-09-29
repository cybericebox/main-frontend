// Role label keys: one canonical name per role, the same in every app (keys role.* in messages).
// Kept free of t() so node tests can import it; roles.ts turns the keys into labels.

// Platform roles stored on the user (AP Backend rbac.Role).
export const PLATFORM_ROLES = ["super_admin", "admin", "admin_viewer", "user"] as const
export type PlatformRole = (typeof PLATFORM_ROLES)[number]

// Event-local management roles by their stored code (AP Backend eventManagerModel.Role).
export const EVENT_ROLES = { 0: "owner", 1: "moderator", 2: "observer" } as const
export type EventRoleCode = keyof typeof EVENT_ROLES

/** Message key of a platform role, or null for an unknown role. */
export function roleKey(role: string): string | null {
  return (PLATFORM_ROLES as readonly string[]).includes(role) ? `role.${role}` : null
}

/** Message key of an event management role by its code, or null for an unknown code. */
export function eventRoleKey(code: number): string | null {
  const name = EVENT_ROLES[code as EventRoleCode]
  return name ? `role.event.${name}` : null
}
