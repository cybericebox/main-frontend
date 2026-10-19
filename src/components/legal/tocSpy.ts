// Which section the reader is in, from the sections' viewport tops (in document order):
// the last one whose top has passed `line` (just below the sticky navbar). Before any has passed, the first one
// once it is on screen; at the very bottom of the page the last one (short closing sections never reach the line).
// -1 = none (the reader is above the first section, e.g. in a long intro).
export function currentSection(tops: number[], line: number, viewport: number, atEnd: boolean): number {
  if (!tops.length) return -1
  if (atEnd) return tops.length - 1
  let current = -1
  tops.forEach((top, i) => {
    if (top <= line) current = i
  })
  if (current === -1 && tops[0] < viewport) return 0
  return current
}
