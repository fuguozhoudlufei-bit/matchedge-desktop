import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import type { AnalyzeMatchResult, MarketComparison, WinDrawLoseProbabilities } from "../lib/model";

const probabilityFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1
});

const directionLabels = {
  home: "home",
  draw: "draw",
  away: "away"
} as const;

type Direction = keyof typeof directionLabels;

interface OddsComparisonDatum {
  direction: Direction;
  label: string;
  modelProbability: number;
  marketProbability: number;
  valueGap: number;
}

export interface OddsComparisonChartProps {
  result: Pick<AnalyzeMatchResult, "winDrawLoseProbabilities" | "marketComparison">;
}

function formatPercent(value: number): string {
  return probabilityFormatter.format(value);
}

function formatSignedPercent(value: number): string {
  const sign = value > 0 ? "+" : "";

  return `${sign}${formatPercent(value)}`;
}

function formatChartTick(value: number | string): string {
  const numericValue = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(numericValue)) {
    return String(value);
  }

  return formatPercent(numericValue);
}

function isChartValueRange(value: unknown): value is readonly (number | string)[] {
  return Array.isArray(value);
}

function formatChartTooltip(
  value: number | string | readonly (number | string)[] | undefined,
  name: string | number | undefined
): [string, string] {
  const rawValue = isChartValueRange(value) ? value[0] : value;
  const numericValue = typeof rawValue === "number" ? rawValue : Number(rawValue);
  const label = name === undefined ? "Probability" : String(name);

  if (!Number.isFinite(numericValue)) {
    return [rawValue === undefined ? "Unavailable" : String(rawValue), label];
  }

  return [formatPercent(numericValue), label];
}

function buildOddsComparisonData(
  probabilities: WinDrawLoseProbabilities,
  marketComparison: MarketComparison
): OddsComparisonDatum[] {
  return [
    {
      direction: "home",
      label: "Home",
      modelProbability: probabilities.home,
      marketProbability: marketComparison.marketProbabilities.home,
      valueGap: marketComparison.valueGap.home
    },
    {
      direction: "draw",
      label: "Draw",
      modelProbability: probabilities.draw,
      marketProbability: marketComparison.marketProbabilities.draw,
      valueGap: marketComparison.valueGap.draw
    },
    {
      direction: "away",
      label: "Away",
      modelProbability: probabilities.away,
      marketProbability: marketComparison.marketProbabilities.away,
      valueGap: marketComparison.valueGap.away
    }
  ];
}

function getLargestGapDatum(data: OddsComparisonDatum[]): OddsComparisonDatum {
  return data.reduce((largest, datum) =>
    Math.abs(datum.valueGap) > Math.abs(largest.valueGap) ? datum : largest
  );
}

function describeGapDirection(valueGap: number): string {
  if (valueGap > 0) {
    return "model higher";
  }

  if (valueGap < 0) {
    return "market higher";
  }

  return "even";
}

export function OddsComparisonChart({ result }: OddsComparisonChartProps) {
  const marketComparison = result.marketComparison;

  if (marketComparison === undefined) {
    return (
      <section
        aria-labelledby="odds-comparison-heading"
        className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-5"
      >
        <h2 className="text-lg font-semibold text-zinc-50" id="odds-comparison-heading">
          Odds comparison
        </h2>
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          Market comparison requires home, draw, and away odds. Enter all three decimal odds to
          compare market probabilities with model probabilities.
        </p>
      </section>
    );
  }

  const data = buildOddsComparisonData(result.winDrawLoseProbabilities, marketComparison);
  const largestGap = getLargestGapDatum(data);

  return (
    <section
      aria-labelledby="odds-comparison-heading"
      className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-5"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-50" id="odds-comparison-heading">
            Odds comparison
          </h2>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Model probabilities compared with normalized market probabilities.
          </p>
        </div>
        <p className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-sm leading-5 text-emerald-100">
          Largest gap:{" "}
          <span className="font-semibold">{directionLabels[largestGap.direction]}</span>{" "}
          <span className="font-semibold">{formatSignedPercent(largestGap.valueGap)}</span>{" "}
          {describeGapDirection(largestGap.valueGap)}
        </p>
      </div>

      <div aria-label="Odds comparison probability chart" className="mt-5 h-72">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart data={data} margin={{ bottom: 8, left: 0, right: 8, top: 8 }}>
            <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="label"
              tick={{ fill: "#d4d4d8", fontSize: 12 }}
              tickLine={false}
            />
            <YAxis
              axisLine={false}
              domain={[0, 1]}
              tick={{ fill: "#d4d4d8", fontSize: 12 }}
              tickFormatter={formatChartTick}
              tickLine={false}
              width={52}
            />
            <Tooltip
              contentStyle={{
                background: "#18181b",
                border: "1px solid #3f3f46",
                borderRadius: 8,
                color: "#fafafa"
              }}
              cursor={{ fill: "#3f3f46", opacity: 0.25 }}
              formatter={formatChartTooltip}
            />
            <Legend wrapperStyle={{ color: "#d4d4d8", fontSize: 12 }} />
            <Bar
              dataKey="modelProbability"
              fill="#10b981"
              name="Model probability"
              radius={[6, 6, 0, 0]}
            />
            <Bar
              dataKey="marketProbability"
              fill="#60a5fa"
              name="Market probability"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-5 overflow-x-auto rounded-lg border border-zinc-800">
        <table
          aria-label="Odds comparison table"
          className="min-w-[640px] w-full border-collapse text-left text-sm"
        >
          <caption className="sr-only">Odds comparison probabilities and value gaps</caption>
          <thead className="bg-zinc-950/70 text-zinc-400">
            <tr>
              <th className="px-4 py-3 font-medium" scope="col">
                Direction
              </th>
              <th className="px-4 py-3 text-right font-medium" scope="col">
                Model probability
              </th>
              <th className="px-4 py-3 text-right font-medium" scope="col">
                Market probability
              </th>
              <th className="px-4 py-3 text-right font-medium" scope="col">
                Value gap
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {data.map((datum) => {
              const isLargestGap = datum.direction === largestGap.direction;

              return (
                <tr
                  className={isLargestGap ? "bg-emerald-400/10" : undefined}
                  key={datum.direction}
                >
                  <th className="px-4 py-3 text-zinc-200" scope="row">
                    <span className="font-medium">{directionLabels[datum.direction]}</span>
                    {isLargestGap ? (
                      <span className="ml-2 rounded border border-emerald-400/30 px-2 py-1 text-xs font-semibold text-emerald-100">
                        Largest gap
                      </span>
                    ) : null}
                  </th>
                  <td className="px-4 py-3 text-right font-semibold text-zinc-50">
                    {formatPercent(datum.modelProbability)}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-zinc-50">
                    {formatPercent(datum.marketProbability)}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-zinc-50">
                    {formatSignedPercent(datum.valueGap)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-sm text-zinc-300">
        Overround:{" "}
        <span className="font-semibold text-zinc-50">
          {formatSignedPercent(marketComparison.overround)}
        </span>
      </p>
    </section>
  );
}
