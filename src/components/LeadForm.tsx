import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { createLead } from "@/lib/leads.functions";
import {
  BUDGET_RANGES,
  leadSchema,
  type BudgetRange,
  type LeadInput,
} from "@/lib/leads-schema";

type FieldErrors = Partial<Record<keyof LeadInput, string>>;

const initial: LeadInput = {
  name: "",
  email: "",
  budget_range: "" as BudgetRange,
  message: "",
};

export function LeadForm() {
  const submit = useServerFn(createLead);
  const [values, setValues] = useState<LeadInput>(initial);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const update = <K extends keyof LeadInput>(key: K, value: LeadInput[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);

    const parsed = leadSchema.safeParse(values);
    if (!parsed.success) {
      const next: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof LeadInput;
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }

    setSubmitting(true);
    try {
      await submit({ data: parsed.data });
      setSuccess(true);
      setValues(initial);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center shadow-sm">
        <h2 className="text-2xl font-semibold text-foreground">Thanks — got it.</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Your message is in. We'll reply to the email you provided shortly.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-6 inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
        >
          Submit another
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="rounded-lg border border-border bg-card p-6 shadow-sm sm:p-8"
    >
      <div className="space-y-5">
        <Field label="Name" htmlFor="name" error={errors.name}>
          <input
            id="name"
            type="text"
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            className={inputClass(!!errors.name)}
            placeholder="Jane Doe"
            autoComplete="name"
          />
        </Field>

        <Field label="Email" htmlFor="email" error={errors.email}>
          <input
            id="email"
            type="email"
            value={values.email}
            onChange={(e) => update("email", e.target.value)}
            className={inputClass(!!errors.email)}
            placeholder="jane@company.com"
            autoComplete="email"
          />
        </Field>

        <Field label="Budget range" htmlFor="budget_range" error={errors.budget_range}>
          <select
            id="budget_range"
            value={values.budget_range}
            onChange={(e) => update("budget_range", e.target.value as BudgetRange)}
            className={inputClass(!!errors.budget_range)}
          >
            <option value="" disabled>
              Select a range…
            </option>
            {BUDGET_RANGES.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Message" htmlFor="message" error={errors.message}>
          <textarea
            id="message"
            rows={5}
            value={values.message}
            onChange={(e) => update("message", e.target.value)}
            className={inputClass(!!errors.message)}
            placeholder="Tell us about your project (min. 10 characters)"
          />
        </Field>

        {serverError && (
          <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {serverError}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          style={{ backgroundImage: "var(--gradient-warm)", boxShadow: "var(--shadow-soft)" }}
          className="inline-flex w-full items-center justify-center rounded-md px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-95 hover:-translate-y-0.5 disabled:opacity-60 disabled:translate-y-0"
        >
          {submitting ? "Sending…" : "Send message"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-foreground">
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  );
}

function inputClass(hasError: boolean) {
  return [
    "block w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground shadow-sm",
    "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
    hasError ? "border-destructive" : "border-input",
  ].join(" ");
}
