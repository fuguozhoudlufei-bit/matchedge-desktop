import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import App from "./App";

describe("App", () => {
  it("renders the app shell copy", () => {
    const html = renderToString(<App />);

    expect(html).toContain("MatchEdge Desktop");
    expect(html).toContain("Football pre-match probability decision terminal");
  });
});

