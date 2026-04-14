export function cn(
  ...inputs: Array<
    string | number | false | null | undefined | Record<string, boolean | undefined | null>
  >
): string {
  const parts: string[] = [];
  for (const input of inputs) {
    if (!input) continue;
    if (typeof input === "string" || typeof input === "number") {
      parts.push(String(input));
      continue;
    }
    for (const key in input) {
      if (input[key]) parts.push(key);
    }
  }
  return parts.join(" ");
}
