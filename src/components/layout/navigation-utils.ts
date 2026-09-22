export function isItemActive(pathname: string, matches: readonly string[]) {
  return matches.some((match) => (match === "/" ? pathname === "/" : pathname.startsWith(match)));
}
