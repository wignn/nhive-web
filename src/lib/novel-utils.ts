// Centralised image URL helper used by all pages.
// Backend returns either an absolute URL (cover_url starting with http)
// or a path that must be joined to cover_base_url returned alongside.
export function buildCoverUrl(coverUrl?: string | null, base?: string | null): string | null {
  if (!coverUrl) return null;
  if (coverUrl.startsWith("http")) return coverUrl;
  if (!base) return coverUrl;
  return `${base.replace(/\/$/, "")}/${coverUrl.replace(/^\//, "")}`;
}

export function classNames(...xs: (string | false | null | undefined)[]) {
  return xs.filter(Boolean).join(" ");
}

export function formatCount(n?: number) {
  if (!n && n !== 0) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}
