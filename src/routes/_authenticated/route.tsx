import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

// Client-only gate: Supabase persists the session in localStorage, which the
// server can't read. Skipping SSR for this subtree avoids redirect loops on
// hard refresh.
export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({ to: "/login" });
    }
    return { user: data.user };
  },
  component: () => <Outlet />,
});
