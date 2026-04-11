import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function parseApiResponse<T = unknown>(res: Response): Promise<T> {
  const contentType = res.headers.get("content-type") || "";

  if (contentType.toLowerCase().includes("application/json")) {
    return (await res.json()) as T;
  }

  const rawText = await res.text();
  const preview = rawText
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);

  throw new Error(
    preview || `Unexpected non-JSON response received (HTTP ${res.status}).`
  );
}
