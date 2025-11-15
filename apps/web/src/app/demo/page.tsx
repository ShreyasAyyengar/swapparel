"use client";

import { useState } from "react";

// Small presentational _components kept at top-level per project guidelines
const Section = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
  <section id={id} className="space-y-4 rounded-lg border border-border bg-card p-6 text-card-foreground">
    <h2 className="font-semibold text-xl">{title}</h2>
    {children}
  </section>
);

const RadiusTile = ({ label, varName }: { label: string; varName: string }) => (
  <div className="flex flex-col items-start gap-2">
    <div className="h-12 w-24 border border-border bg-muted" style={{ borderRadius: `var(${varName})` }} />
    <div className="text-xs">
      <div className="font-medium">{label}</div>
      <code>{varName}</code>
    </div>
  </div>
);

const chartTokens = [
  { name: "bg-chart-1", cls: "bg-chart-1" },
  { name: "bg-chart-2", cls: "bg-chart-2" },
  { name: "bg-chart-3", cls: "bg-chart-3" },
  { name: "bg-chart-4", cls: "bg-chart-4" },
  { name: "bg-chart-5", cls: "bg-chart-5" },
] as const;

const sidebarTokens = [
  { name: "bg-sidebar text-sidebar-foreground", cls: "bg-sidebar text-sidebar-foreground" },
  { name: "bg-sidebar-accent text-sidebar-accent-foreground", cls: "bg-sidebar-accent text-sidebar-accent-foreground" },
  { name: "bg-sidebar-primary text-sidebar-primary-foreground", cls: "bg-sidebar-primary text-sidebar-primary-foreground" },
] as const;

const buttonTokens = [
  { label: "Primary", cls: "bg-primary text-accent-foreground" },
  { label: "Secondary", cls: "bg-secondary text-secondary-foreground" },
  { label: "Accent", cls: "bg-accent text-accent-foreground" },
  { label: "Destructive", cls: "bg-destructive text-white font-bold" },
  { label: "Success", cls: "bg-success" },
] as const;

const DemoPage = () => {
  const [isDark, setIsDark] = useState(false);

  return (
    <div className="px-6 py-10">
      {/* Scope dark mode to this page by toggling `.dark` on a wrapper only */}
      <div className={isDark ? "dark" : undefined}>
        <div className="mx-auto max-w-5xl space-y-8 bg-background p-6 text-foreground">
          <header className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <h1 className="font-bold text-2xl">globals.css design tokens demo</h1>
              <p className="max-w-prose text-muted-foreground text-sm">
                This page demonstrates how pre-formatting tokens in globals.css streamlines design and development. Colors and radii are defined
                as CSS variables, surfaced through Tailwind class names (e.g., bg-background, text-foreground). A local dark-mode toggle shows
                how tokens swap without changing component code.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground text-sm">Mode:</span>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md border border-input bg-secondary px-3 py-2 text-secondary-foreground text-sm shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => setIsDark((v) => !v)}
                aria-pressed={isDark}
              >
                {isDark ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="false">
                    <title>Dark mode</title>
                    <path d="M21.64 13a9 9 0 01-9.64 8 9 9 0 008-9.64A7 7 0 0112 19a7 7 0 010-14 7 7 0 019.64 8z" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="false">
                    <title>Light mode</title>
                    <path d="M12 4a1 1 0 011-1h0a1 1 0 011 1v1a1 1 0 11-2 0zM5.64 6.05a1 1 0 011.41 0l.7.7A1 1 0 116.76 8.4l-.7-.7a1 1 0 010-1.41zM4 13a1 1 0 100-2H3a1 1 0 100 2zM5.64 17.95a1 1 0 000-1.41l.7-.7a1 1 0 111.41 1.41l-.7.7a1 1 0 01-1.41 0zM13 20a1 1 0 10-2 0v1a1 1 0 002 0zM17.95 18.36a1 1 0 01-1.41 0l-.7-.7a1 1 0 111.41-1.41l.7.7a1 1 0 010 1.41zM21 13a1 1 0 000-2h-1a1 1 0 000 2zM17.24 8.4a1 1 0 100-1.41l.7-.7a1 1 0 00-1.41 0l-.7.7a1 1 0 001.41 1.41zM12 8a4 4 0 100 8 4 4 0 000-8z" />
                  </svg>
                )}
                <span className="font-medium">{isDark ? "Dark" : "Light"}</span>
              </button>
            </div>
          </header>

          <nav aria-label="On-page navigation" className="rounded-md border border-border bg-muted p-3">
            <ul className="flex flex-wrap gap-3 text-sm">
              <li>
                <a className="underline hover:no-underline" href="#typography">
                  Typography
                </a>
              </li>
              <li>
                <a className="underline hover:no-underline" href="#links">
                  Links & Focus
                </a>
              </li>
              <li>
                <a className="underline hover:no-underline" href="#table">
                  Table
                </a>
              </li>
              <li>
                <a className="underline hover:no-underline" href="#code">
                  Code block
                </a>
              </li>
              <li>
                <a className="underline hover:no-underline" href="#layout">
                  Layout preview
                </a>
              </li>
              <li>
                <a className="underline hover:no-underline" href="#background">
                  Background & Text
                </a>
              </li>
              <li>
                <a className="underline hover:no-underline" href="#components">
                  Buttons & Surfaces
                </a>
              </li>
              <li>
                <a className="underline hover:no-underline" href="#forms">
                  Form Controls
                </a>
              </li>
              <li>
                <a className="underline hover:no-underline" href="#radius">
                  Radii
                </a>
              </li>
              <li>
                <a className="underline hover:no-underline" href="#sidebar">
                  Sidebar Palette
                </a>
              </li>
              <li>
                <a className="underline hover:no-underline" href="#charts">
                  Chart Tokens
                </a>
              </li>
              <li>
                <a className="underline hover:no-underline" href="#alerts">
                  Alerts
                </a>
              </li>
              <li>
                <a className="underline hover:no-underline" href="#tips">
                  Why pre-format?
                </a>
              </li>
            </ul>
          </nav>

          <Section id="typography" title="Typography scale and muted text">
            <div className="space-y-2">
              <h1 className="font-bold text-3xl">H1 — Page Title</h1>
              <h2 className="font-semibold text-2xl">H2 — Section</h2>
              <h3 className="font-semibold text-xl">H3 — Subsection</h3>
              <p>
                Body copy uses <code>text-foreground</code> by default. You can use
                <span className="text-muted-foreground"> muted foreground</span> for secondary information.
              </p>
              <ul className="list-disc pl-5 text-muted-foreground text-sm">
                <li>Consistent type scale keeps rhythm across pages.</li>
                <li>Tokens ensure contrast is handled in both modes.</li>
              </ul>
            </div>
          </Section>

          <Section id="links" title="Links and focus ring">
            <p>
              Links should be visually clear and keyboard focusable. The input focus ring below comes from the
              <code>--ring</code> token via <code>focus-visible:ring-ring</code>:
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <a href="#tips" className="underline hover:no-underline">
                Jump to tips
              </a>
              <input
                aria-label="Sample focus ring"
                className="rounded-md border border-input bg-background px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Tab here to see focus"
              />
              <button type="button" className="rounded-md bg-secondary px-3 py-2 text-secondary-foreground text-sm shadow">
                Example button
              </button>
            </div>
          </Section>

          <Section id="table" title="Table with surface and border tokens">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px] border-collapse rounded-md border border-border">
                <thead className="bg-muted">
                  <tr>
                    <th scope="col" className="px-3 py-2 text-left font-semibold">
                      Name
                    </th>
                    <th scope="col" className="px-3 py-2 text-left font-semibold">
                      Role
                    </th>
                    <th scope="col" className="px-3 py-2 text-left font-semibold">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card text-card-foreground">
                  {[
                    { n: "Avery", r: "Designer", s: "Active" },
                    { n: "Jordan", r: "Engineer", s: "Pending" },
                    { n: "Kai", r: "PM", s: "Inactive" },
                  ].map((row) => (
                    <tr key={row.n} className="border-border border-t">
                      <th scope="row" className="px-3 py-2 text-left font-medium">
                        {row.n}
                      </th>
                      <td className="px-3 py-2">{row.r}</td>
                      <td className="px-3 py-2">
                        <span
                          className="inline-flex items-center gap-2 rounded-sm px-2 py-0.5 text-xs"
                          style={{
                            backgroundColor: row.s === "Active" ? "var(--accent)" : row.s === "Pending" ? "var(--muted)" : "transparent",
                            color: row.s === "Active" ? "var(--accent-foreground)" : undefined,
                          }}
                        >
                          {row.s}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section id="code" title="Code block and inline code">
            <p>
              Use <code>bg-muted</code> for blocks and <code>text-muted-foreground</code> for comments.
            </p>
            <pre className="overflow-x-auto rounded-md border border-border bg-muted p-3 text-sm">
              {`// Tokens power consistent UIs
<button className="bg-primary text-primary-foreground rounded-md px-3 py-2">Click</button>`}
            </pre>
          </Section>

          <Section id="layout" title="Layout preview with sidebar tokens">
            <div className="grid gap-4 md:grid-cols-[240px_1fr]">
              <aside className="rounded-md border border-sidebar-border bg-sidebar p-3 text-sidebar-foreground">
                <div className="mb-2 font-medium">Sidebar</div>
                <nav>
                  <ul className="space-y-1 text-sm">
                    <li>
                      <a href="#background" className="underline hover:no-underline">
                        Background
                      </a>
                    </li>
                    <li>
                      <a href="#components" className="underline hover:no-underline">
                        Components
                      </a>
                    </li>
                    <li>
                      <a href="#forms" className="underline hover:no-underline">
                        Forms
                      </a>
                    </li>
                  </ul>
                </nav>
              </aside>
              <main className="rounded-md border border-border bg-card p-3 text-card-foreground">
                <div className="mb-2 font-medium">Content</div>
                <p className="text-muted-foreground text-sm">The sidebar uses its own palette while content uses card tokens.</p>
              </main>
            </div>
          </Section>

          <Section id="alerts" title="Alerts using semantic colors">
            <div className="grid gap-3 md:grid-cols-2">
              <div
                className="rounded-md border border-border p-3"
                style={{ backgroundColor: "var(--accent)", color: "var(--accent-foreground)" }}
              >
                <div className="mb-1 font-medium">Info</div>
                <p className="text-sm">Accent surfaces are great for neutral callouts.</p>
              </div>
              <div className="rounded-md border border-border p-3" style={{ backgroundColor: "var(--destructive)", color: "white" }}>
                <div className="mb-1 font-medium">Destructive</div>
                <p className="text-sm">Use for irreversible actions and confirm with users.</p>
              </div>
            </div>
          </Section>

          <Section id="background" title="Background & Text tokens">
            <div className="space-y-3">
              <p>
                The base layer applies <code>bg-background</code> and <code>text-foreground</code> using CSS variables. Toggling dark mode swaps
                those variables at the wrapper level without changing component code.
              </p>
              <div className="rounded-md border border-border bg-popover p-4 text-popover-foreground">
                <div className="mb-2 font-medium">Popover surface</div>
                <p className="text-muted-foreground text-sm">
                  Borders use <code>border-border</code>. Muted text uses <code>text-muted-foreground</code>.
                </p>
              </div>
            </div>
          </Section>

          <Section id="components" title="Buttons and Surface tokens">
            <div className="flex flex-wrap gap-3">
              {buttonTokens.map((b) => (
                <button
                  type="button"
                  key={b.label}
                  className={`${b.cls} rounded-md px-3 py-2 text-sm shadow transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
                >
                  {b.label}
                </button>
              ))}
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-border bg-card p-4 text-card-foreground">
                <div className="mb-2 font-medium">Card</div>
                <p className="text-muted-foreground text-sm">Card text and background have their own tokens.</p>
              </div>
              <div className="rounded-lg border border-border bg-accent p-4 text-accent-foreground">
                <div className="mb-2 font-medium">Accent surface</div>
                <p className="text-sm">Useful for callouts that adapt to mode.</p>
              </div>
            </div>
          </Section>

          <Section id="forms" title="Form controls: input, borders and ring tokens">
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid gap-2">
                <label htmlFor="email" className="font-medium text-sm">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground shadow-sm outline-none ring-0 placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="you@example.com"
                />
                <p className="text-muted-foreground text-xs">
                  Focus to see the ring based on <code>--ring</code>.
                </p>
              </div>
              <div className="grid gap-2">
                <label htmlFor="message" className="font-medium text-sm">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={3}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Tell us more..."
                />
              </div>
              <div>
                <button type="submit" className="rounded-md bg-primary px-3 py-2 text-primary-foreground text-sm shadow">
                  Submit
                </button>
              </div>
            </form>
          </Section>

          <Section id="radius" title="Radius variables">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              <RadiusTile label="--radius-sm" varName="--radius-sm" />
              <RadiusTile label="--radius-md" varName="--radius-md" />
              <RadiusTile label="--radius-lg" varName="--radius-lg" />
              <RadiusTile label="--radius-xl" varName="--radius-xl" />
            </div>
          </Section>

          <Section id="sidebar" title="Sidebar palette tokens">
            <div className="grid gap-4 md:grid-cols-3">
              {sidebarTokens.map((t) => (
                <div key={t.name} className={`rounded-md border border-sidebar-border p-4 ${t.cls}`}>
                  <div className="font-medium">{t.name}</div>
                  <p className="text-sm opacity-80">Great for layouts that need a separate sidebar theme.</p>
                </div>
              ))}
            </div>
          </Section>

          <Section id="charts" title="Chart color tokens">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
              {chartTokens.map((t) => (
                <div key={t.name} className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-md border border-border ${t.cls}`} />
                  <code className="text-sm">{t.name}</code>
                </div>
              ))}
            </div>
          </Section>

          <Section id="tips" title="Why pre-format globals.css?">
            <div className="space-y-3">
              <p>
                Pre-formatting tokens in <code>globals.css</code> centralizes design decisions and makes them trivially available via class
                names. It improves consistency, enables instant theming via a single wrapper class (<code>.dark</code>), and keeps components
                simple and portable.
              </p>
              <p>
                We also support additional variables beyond Tailwind-exposed tokens. For example, the "peepee" variable below demonstrates how
                any CSS variable can be consumed directly:
              </p>
              <div className="inline-flex items-center gap-3 rounded-md border border-border p-2">
                <div className="h-6 w-6 rounded" style={{ backgroundColor: "var(--peepee)" }} title="Custom variable swatch" />
                <code>var(--peepee)</code>
              </div>
              <p className="text-muted-foreground text-sm">
                Names follow a semantic pattern (background/foreground, surface/foreground pairs, stateful colors like primary, secondary,
                accent, destructive) so usage is predictable and readable.
              </p>
            </div>
          </Section>

          <footer className="text-center text-muted-foreground text-xs">
            <p>
              Tip: The dark variant in Tailwind is configured as an ancestor class. Here we toggle the <code>.dark</code>
              class on a page-local wrapper so the rest of the app remains unaffected.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default DemoPage;
