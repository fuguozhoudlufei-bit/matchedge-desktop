import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { analyzeMatch } from "../lib/model";
import { OddsComparisonChart } from "./OddsComparisonChart";

describe("OddsComparisonChart", () => {
  it("renders a readable empty state when market odds are missing", () => {
    const result = analyzeMatch({
      homeLambda: 1.35,
      awayLambda: 1.05,
      maxGoals: 6
    });

    const html = renderToString(<OddsComparisonChart result={result} />);

    expect(html).toContain("Odds comparison");
    expect(html).toContain("Market comparison requires home, draw, and away odds.");
  });

  it("renders the compact comparison table when market output exists", () => {
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

    const html = renderToString(<OddsComparisonChart result={result} />);

    expect(html).toContain("Direction");
    expect(html).toContain("Model probability");
    expect(html).toContain("Market probability");
    expect(html).toContain("Value gap");
    expect(html).toContain("home");
    expect(html).toContain("draw");
    expect(html).toContain("away");
  });

  it("labels the direction with the largest absolute value gap", () => {
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

    const html = renderToString(<OddsComparisonChart result={result} />);

    expect(html).toMatch(/Largest gap:[\s\S]*home/);
    expect(html).toContain("model higher");
  });
});
