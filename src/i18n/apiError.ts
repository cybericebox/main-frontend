// Localize an API error by its stable numeric code (Status.Code), NOT by the
// backend's English Status.Message. The backend is the source of truth for codes
// and English text (messages/errors.en.json is generated from it); uk overrides
// per code. Resolution: uk → en → generic. A non-API error (network/parse) or an
// error without a code falls back to the generic UI-language message.
//
// errors.uk.json is intentionally partial: codes without a uk entry fall through
// to the English catalog until translated.
import errorsUk from "../../messages/errors.uk.json"
import errorsEn from "../../messages/errors.en.json"
import { ApiError } from "@/api/client"
import { errorMessageChoice } from "./errorMessage"
import { t } from "./t"

const uk = errorsUk as Record<string, string>
const en = errorsEn as Record<string, string>

export function localizedError(err: unknown): string {
  if (!(err instanceof ApiError)) return t("error.generic")
  const choice = errorMessageChoice(err, (key) => Boolean(uk[key] ?? en[key]))
  if ("catalog" in choice) return uk[choice.catalog] ?? en[choice.catalog]
  return "vars" in choice ? t(choice.key, choice.vars) : t(choice.key)
}
