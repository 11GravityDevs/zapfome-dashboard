export type MenuMediaType = "image" | "pdf";

export function getMenuMediaType(url: string): MenuMediaType {
  return url.split("?")[0].toLowerCase().endsWith(".pdf") ? "pdf" : "image";
}

export function getFileNameFromUrl(url: string): string {
  return decodeURIComponent(url.split("?")[0].split("/").pop() ?? "arquivo");
}
