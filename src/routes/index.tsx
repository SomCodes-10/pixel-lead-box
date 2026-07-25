import { createFileRoute } from "@tanstack/react-router";
import { LeadForm } from "@/components/LeadForm";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LeadDesk Mini — Get in touch" },
      {
        name: "description",
        content:
          "Tell us about your project. Send a message with your budget and we'll get back to you.",
      },
      { property: "og:title", content: "LeadDesk Mini — Get in touch" },
      {
        property: "og:description",
        content:
          "Tell us about your project. Send a message with your budget and we'll get back to you.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ backgroundImage: "var(--gradient-surface)" }}
      />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-2xl px-4 py-16 sm:py-24">
          <header className="mb-10 text-center">
            <p
              className="text-xs font-semibold uppercase tracking-[0.2em] bg-clip-text text-transparent"
              style={{ backgroundImage: "var(--gradient-warm)" }}
            >
              LeadDesk Mini
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
              <span className="text-foreground">Let's talk about </span>
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "var(--gradient-primary)" }}
              >
                your project.
              </span>
            </h1>
            <p className="mt-4 text-base text-muted-foreground">
              Share a few details and we'll follow up by email.
            </p>
          </header>
          <LeadForm />
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
      <a
        href="https://digitalheroesco.com"
        target="_blank"
        rel="noreferrer"
        className="hover:text-foreground hover:underline"
      >
        Built for Digital Heroes Training Task
      </a>
    </footer>
  );
}
