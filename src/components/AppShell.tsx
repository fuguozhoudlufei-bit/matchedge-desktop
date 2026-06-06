import { SingleMatchAnalysis } from "./SingleMatchAnalysis";

export function AppShell() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-8 sm:px-8 lg:px-10">
        <header className="border-l-4 border-emerald-400 pl-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">
            Local desktop terminal
          </p>
          <h1 className="mt-3 text-3xl font-semibold sm:text-5xl">MatchEdge Desktop</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-300 sm:text-lg">
            Football pre-match probability decision terminal
          </p>
        </header>

        <SingleMatchAnalysis />
      </div>
    </main>
  );
}
