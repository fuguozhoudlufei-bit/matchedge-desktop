import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { analyzeMatch } from "../lib/model";
import { AIExplanationPanel } from "./AIExplanationPanel";

describe("AIExplanationPanel", () => {
  it("renders deterministic explanation sections and constraints", () => {
    const result = analyzeMatch({
      homeLambda: 1.35,
      awayLambda: 1.05,
      maxGoals: 6,
      marketOdds: {
        home: 5,
        draw: 3,
        away: 2
      }
    });

    const html = renderToString(
      <AIExplanationPanel awayTeam="Away FC" homeTeam="Home FC" result={result} />
    );

    expect(html).toContain("AI explanation");
    expect(html).toContain("Local deterministic draft");
    expect(html).toContain("Generated from local analyzeMatch output.");
    expect(html).toContain("Summary");
    expect(html).toContain("Probability explanation");
    expect(html).toContain("Market explanation");
    expect(html).toContain("Risk notes");
    expect(html).toContain("Counter arguments");
    expect(html).toContain("Data limitations");
    expect(html).toContain("Next checks");
    expect(html).toContain("Explanation constraints");
    expect(html).toContain("Do not change model probabilities.");
  });
});
