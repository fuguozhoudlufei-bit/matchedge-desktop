import { describe, expect, it } from "vitest";

import { analyzeMatch } from "../model";
import {
  buildExplanationInput,
  buildExplanationPrompt,
  buildLocalExplanationDraft,
  EXPLANATION_CONSTRAINTS
} from "./index";

describe("AI explanation utilities", () => {
  it("builds a prompt containing model probabilities from the input", () => {
    const result = analyzeMatch({
      homeLambda: 1.35,
      awayLambda: 1.05,
      maxGoals: 6
    });
    const input = buildExplanationInput(result);
    const prompt = buildExplanationPrompt(input);

    expect(prompt).toContain(
      `Model home probability: ${result.winDrawLoseProbabilities.home.toFixed(4)}`
    );
    expect(prompt).toContain(
      `Model draw probability: ${result.winDrawLoseProbabilities.draw.toFixed(4)}`
    );
    expect(prompt).toContain(
      `Model away probability: ${result.winDrawLoseProbabilities.away.toFixed(4)}`
    );
  });

  it("builds a prompt containing hard explanation constraints", () => {
    const result = analyzeMatch({
      homeLambda: 1.35,
      awayLambda: 1.05,
      maxGoals: 6
    });
    const input = buildExplanationInput(result);
    const prompt = buildExplanationPrompt(input);

    for (const constraint of EXPLANATION_CONSTRAINTS) {
      expect(prompt).toContain(constraint.title);
    }
  });

  it("copies source probabilities into the local draft without changing them", () => {
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
    const input = buildExplanationInput(result);
    const draft = buildLocalExplanationDraft(input);

    expect(draft.usesExternalApi).toBe(false);
    expect(draft.sourceModelProbabilities).toEqual(result.winDrawLoseProbabilities);
    expect(draft.sourceMarketProbabilities).toEqual(
      result.marketComparison?.marketProbabilities
    );
  });

  it("includes a missing market odds limitation when market comparison is absent", () => {
    const result = analyzeMatch({
      homeLambda: 1.35,
      awayLambda: 1.05,
      maxGoals: 6
    });
    const input = buildExplanationInput(result);
    const draft = buildLocalExplanationDraft(input);

    expect(draft.marketExplanation.items).toContain(
      "Market odds were not provided, so no model-market comparison is available."
    );
    expect(draft.dataLimitations.items).toContain(
      "Missing market odds limit the explanation to model probabilities and recommendation reasons."
    );
  });
});
