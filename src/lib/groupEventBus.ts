/**
 * In-memory pub/sub for group ledger invalidation signals (SSE).
 * Single Node process only — not suitable for horizontal scaling; fine for demos/local dev.
 */

type LedgerListener = (payload: Record<string, unknown>) => void;

const listeners = new Map<string, Set<LedgerListener>>();

export function subscribeGroupLedger(
  groupId: string,
  listener: LedgerListener
): () => void {
  const key = groupId.toString();
  let set = listeners.get(key);
  if (!set) {
    set = new Set();
    listeners.set(key, set);
  }
  set.add(listener);
  return () => {
    set!.delete(listener);
    if (set!.size === 0) listeners.delete(key);
  };
}

/** Notify all SSE clients watching this group to refetch ledger/balances. */
export function publishGroupLedgerInvalidation(
  groupId: string,
  meta?: Record<string, unknown>
) {
  const set = listeners.get(groupId.toString());
  if (!set?.size) return;
  const payload = {
    type: "invalidate",
    at: Date.now(),
    ...meta,
  };
  for (const listener of [...set]) {
    try {
      listener(payload);
    } catch {
      // ignore broken stream callbacks
    }
  }
}
