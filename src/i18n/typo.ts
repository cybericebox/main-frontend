// Ukrainian typography: no dangling short words at line ends. A no-break space (U+00A0)
// goes after 1–2-letter words, short prepositions and conjunctions («і лабораторій»),
// and before an em dash («слово — далі»). Cyrillic-aware word boundaries.

const SHORT = ["і", "й", "в", "у", "з", "із", "зі", "та", "до", "на", "по", "за", "від", "для", "не", "чи", "а", "о", "як", "що", "це", "ці"]
const NB = " "
// not preceded by a letter/digit/apostrophe/hyphen, followed by a plain space
const AFTER_SHORT = new RegExp(`(?<![\\p{L}\\p{N}'’ʼ\\-])(${SHORT.join("|")}) `, "giu")
const BEFORE_DASH = / —/g

export function nbsp(text: string): string {
  return text.replace(AFTER_SHORT, `$1${NB}`).replace(BEFORE_DASH, `${NB}—`)
}

// Legal pages read in a narrow column: there only 1–2-letter prepositions and single letters stay glued
// (the dash glue stays too), so long lines are not pushed down and the right edge is smoother.
const LEGAL_GLUE = new Set(["і", "й", "в", "у", "з", "а", "о", "із", "зі", "до", "на", "по", "за"])
const GLUED = new RegExp(`(?<![\\p{L}\\p{N}'’ʼ\\-])(${SHORT.join("|")})${NB}`, "giu")

export function legalNbsp(text: string): string {
  return text.replace(GLUED, (m, word: string) => (LEGAL_GLUE.has(word.toLowerCase()) ? m : word + " "))
}
