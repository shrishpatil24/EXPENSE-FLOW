import dbConnect from "@/lib/db";
import Group from "@/models/Group";
import { verifyToken } from "@/lib/auth";
import { subscribeGroupLedger } from "@/lib/groupEventBus";

export const dynamic = "force-dynamic";

function isMember(group: { members: unknown[] }, userId: string): boolean {
  return group.members.some((m) => String(m) === userId);
}

/**
 * Server-Sent Events: clients receive `invalidate` payloads after mutations on this group.
 * Auth: pass JWT as `?token=` (EventSource cannot set Authorization in all browsers).
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: groupId } = await params;
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  if (!token) {
    return new Response(JSON.stringify({ error: "token query required" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return new Response(JSON.stringify({ error: "Invalid token" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  await dbConnect();
  const group = await Group.findById(groupId).select("members");
  if (!group) {
    return new Response(JSON.stringify({ error: "Group not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!isMember(group, decoded.userId)) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const encoder = new TextEncoder();
  let dispose: (() => void) | undefined;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (obj: Record<string, unknown>) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(obj)}\n\n`)
        );
      };

      const unsubscribe = subscribeGroupLedger(groupId, send);
      const ping = setInterval(() => {
        controller.enqueue(encoder.encode(`: ping ${Date.now()}\n\n`));
      }, 25000);

      send({ type: "connected", groupId });

      dispose = () => {
        clearInterval(ping);
        unsubscribe();
      };
    },
    cancel() {
      dispose?.();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
