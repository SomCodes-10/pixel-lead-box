import { createServerFn } from "@tanstack/react-start";
import { leadSchema, type LeadInput } from "./leads-schema";

// Server-side validation + insert. Runs the same zod schema the form uses,
// then writes to the `leads` table. Status defaults to 'New' in the DB.
export const createLead = createServerFn({ method: "POST" })
  .inputValidator((data: LeadInput) => leadSchema.parse(data))
  .handler(async ({ data }) => {
    const { createClient } = await import("@supabase/supabase-js");
    const url = process.env.SUPABASE_URL!;
    const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
    const supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) => {
          const h = new Headers(init?.headers);
          if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
            h.delete("Authorization");
          }
          h.set("apikey", key);
          return fetch(input, { ...init, headers: h });
        },
      },
    });

    const { error } = await supabase.from("leads").insert({
      name: data.name,
      email: data.email,
      budget_range: data.budget_range,
      message: data.message,
    });

    if (error) {
      console.error("createLead insert failed:", error);
      throw new Error("Could not save your message. Please try again.");
    }

    return { ok: true as const };
  });
