import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LEAD_STATUSES, type Lead, type LeadStatus } from "@/lib/leads-schema";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — LeadDesk Mini" },
      { name: "description", content: "Review, search, and update captured leads." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin — LeadDesk Mini" },
      { property: "og:description", content: "Review, search, and update captured leads." },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });
      if (cancelled) return;
      if (error) setError(error.message);
      else setLeads((data ?? []) as Lead[]);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!leads) return [];
    const q = query.trim().toLowerCase();
    if (!q) return leads;
    return leads.filter(
      (l) => l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q),
    );
  }, [leads, query]);

  async function updateStatus(id: string, status: LeadStatus) {
    // Optimistic update
    setLeads((prev) =>
      prev ? prev.map((l) => (l.id === id ? { ...l, status } : l)) : prev,
    );
    const { error } = await supabase.from("leads").update({ status }).eq("id", id);
    if (error) {
      setError(error.message);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Leads
            </h1>
            <p className="text-sm text-muted-foreground">
              {leads ? `${filtered.length} of ${leads.length}` : "Loading…"}
            </p>
          </div>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </header>

        {error && (
          <p className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <Th>Name</Th>
                  <Th>Email</Th>
                  <Th>Budget</Th>
                  <Th>Message</Th>
                  <Th>Status</Th>
                  <Th>Created</Th>
                </tr>
              </thead>
              <tbody>
                {leads === null ? (
                  <EmptyRow>Loading leads…</EmptyRow>
                ) : filtered.length === 0 ? (
                  <EmptyRow>No leads found.</EmptyRow>
                ) : (
                  filtered.map((lead) => (
                    <tr key={lead.id} className="border-t border-border align-top">
                      <Td className="font-medium text-foreground">{lead.name}</Td>
                      <Td>
                        <a
                          href={`mailto:${lead.email}`}
                          className="text-foreground hover:underline"
                        >
                          {lead.email}
                        </a>
                      </Td>
                      <Td>{lead.budget_range}</Td>
                      <Td className="max-w-sm">
                        <p className="whitespace-pre-wrap text-muted-foreground">
                          {lead.message}
                        </p>
                      </Td>
                      <Td>
                        <StatusSelect
                          value={lead.status}
                          onChange={(next) => updateStatus(lead.id, next)}
                        />
                      </Td>
                      <Td className="whitespace-nowrap text-muted-foreground">
                        {new Date(lead.created_at).toLocaleString()}
                      </Td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 font-medium">{children}</th>;
}
function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-4 py-3 text-foreground ${className}`}>{children}</td>;
}
function EmptyRow({ children }: { children: React.ReactNode }) {
  return (
    <tr>
      <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">
        {children}
      </td>
    </tr>
  );
}

function StatusSelect({
  value,
  onChange,
}: {
  value: LeadStatus;
  onChange: (next: LeadStatus) => void;
}) {
  const tone =
    value === "New"
      ? "border-primary/30 bg-primary/10 text-foreground"
      : value === "Contacted"
        ? "border-chart-2/40 bg-chart-2/10 text-foreground"
        : "border-muted-foreground/30 bg-muted text-muted-foreground";
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as LeadStatus)}
      className={`rounded-md border px-2 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-ring ${tone}`}
    >
      {LEAD_STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
