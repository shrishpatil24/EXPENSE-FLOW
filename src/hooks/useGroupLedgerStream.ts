"use client";

import { useEffect, useRef } from "react";

/**
 * Subscribes to SSE ledger invalidation for a group. Refetches only on `invalidate` events.
 * Uses `?token=` because browser EventSource cannot send Authorization headers reliably.
 */
export function useGroupLedgerStream(
  groupId: string | undefined,
  token: string | null,
  onInvalidate: () => void
) {
  const onInvalidateRef = useRef(onInvalidate);

  useEffect(() => {
    onInvalidateRef.current = onInvalidate;
  }, [onInvalidate]);

  useEffect(() => {
    if (!groupId || !token) return;

    const url = `/api/groups/${groupId}/events?token=${encodeURIComponent(token)}`;
    const es = new EventSource(url);

    es.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data as string) as { type?: string };
        if (data.type === "invalidate") {
          onInvalidateRef.current();
        }
      } catch {
        /* ignore malformed */
      }
    };

    es.onerror = () => {
      es.close();
    };

    return () => es.close();
  }, [groupId, token]);
}
