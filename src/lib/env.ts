// Operator values come only from the deployment env (NEXT_PUBLIC_*), no fallbacks.
// Callers must pass `process.env.NEXT_PUBLIC_X` literally (Next inlines it at build,
// the container entrypoint substitutes the placeholder at start); a missing value throws.
export function requiredEnv(value: string | undefined, name: string): string {
  if (!value) throw new Error(`${name} is required`)
  return value
}
