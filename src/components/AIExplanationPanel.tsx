import { useMemo } from "react";

import {
  buildExplanationInput,
  buildLocalExplanationDraft,
  type ExplanationRiskNote,
  type ExplanationSection
} from "../lib/ai";
import type { AnalyzeMatchResult } from "../lib/model";

interface AIExplanationPanelProps {
  awayTeam: string;
  homeTeam: string;
  result: AnalyzeMatchResult;
}

const riskNoteClasses: Record<ExplanationRiskNote["level"], string> = {
  info: "border-sky-400/30 bg-sky-400/10 text-sky-100",
  caution: "border-amber-400/30 bg-amber-400/10 text-amber-100"
};

function ExplanationSectionList({ section }: { section: ExplanationSection }) {
  return (
    <div>
      <h3 className="text-base font-semibold text-zinc-50">{section.title}</h3>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-300">
        {section.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export function AIExplanationPanel({ awayTeam, homeTeam, result }: AIExplanationPanelProps) {
  const draft = useMemo(() => {
    const input = buildExplanationInput(result, {
      awayTeamLabel: awayTeam,
      homeTeamLabel: homeTeam
    });

    return buildLocalExplanationDraft(input);
  }, [awayTeam, homeTeam, result]);

  return (
    <section
      aria-labelledby="ai-explanation-heading"
      className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-5"
    >
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">
          Local deterministic draft
        </p>
        <h2 className="mt-2 text-lg font-semibold text-zinc-50" id="ai-explanation-heading">
          AI explanation
        </h2>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          Generated from local analyzeMatch output. No external AI API call is made, and model
          probabilities remain the source of truth.
        </p>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <ExplanationSectionList section={draft.summary} />
        <ExplanationSectionList section={draft.probabilityExplanation} />
        <ExplanationSectionList section={draft.marketExplanation} />
        <ExplanationSectionList section={draft.counterArguments} />
        <ExplanationSectionList section={draft.dataLimitations} />
        <ExplanationSectionList section={draft.nextChecks} />
      </div>

      <div className="mt-6">
        <h3 className="text-base font-semibold text-zinc-50">Risk notes</h3>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {draft.riskNotes.map((note) => (
            <li
              className={`rounded-lg border px-3 py-2 text-sm leading-6 ${riskNoteClasses[note.level]}`}
              key={note.message}
            >
              {note.message}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 rounded-lg border border-zinc-800 bg-zinc-950/40 p-4">
        <h3 className="text-base font-semibold text-zinc-50">Explanation constraints</h3>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {draft.constraints.map((constraint) => (
            <li className="text-sm leading-6 text-zinc-300" key={constraint.id}>
              <span className="font-semibold text-zinc-100">{constraint.title}</span>{" "}
              {constraint.description}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
