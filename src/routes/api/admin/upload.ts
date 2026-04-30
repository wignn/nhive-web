import { createFileRoute } from "@tanstack/react-router";
import { gatewayFetch } from "@/server/gateway.server";
import { getSession } from "@/server/session";

export const Route = createFileRoute("/api/admin/upload")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const session = await getSession();
        if (!session.data.token || session.data.user?.role !== "admin") {
          return new Response("Forbidden", { status: 403 });
        }
        const formData = await request.formData();
        // Forward FormData with auth + internal key
        const res = (await gatewayFetch(`/api/v1/admin/upload`, {
          method: "POST",
          body: formData as any,
          token: session.data.token,
          raw: true,
        })) as Response;
        const body = await res.text();
        return new Response(body, {
          status: res.status,
          headers: { "Content-Type": res.headers.get("content-type") || "application/json" },
        });
      },
    },
  },
});
