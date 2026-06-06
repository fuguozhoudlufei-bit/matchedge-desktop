import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SingleMatchAnalysis } from "./SingleMatchAnalysis";

describe("SingleMatchAnalysis", () => {
  it("renders the analysis form and default deterministic output", () => {
    const html = renderToString(<SingleMatchAnalysis />);

    expect(html).toContain("Single-match analysis");
    expect(html).toContain("Home expected goals lambda");
    expect(html).toContain("Away expected goals lambda");
    expect(html).toContain("Win / Draw / Lose");
    expect(html).toContain("Post-match review");
    expect(html).toContain("Prediction direction");
    expect(html).toContain("Top scores");
    expect(html).toContain("Over / Under");
    expect(html).toContain("Recommendation");
  });
});
