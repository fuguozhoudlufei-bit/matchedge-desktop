import { useMemo, useState, type ChangeEvent } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import type { RiskLevel, WinDrawLoseProbabilities } from "../lib/model";
import { AIExplanationPanel } from "./AIExplanationPanel";
import {
  buildSingleMatchAnalysis,
  defaultSingleMatchFormState,
  type SingleMatchFormState
} from "./singleMatchAnalysisForm";
import { OddsComparisonChart } from "./OddsComparisonChart";
import { SingleMatchReviewPanel } from "./SingleMatchReviewPanel";

const probabilityFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1
});

const decimalFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const chartBarColor = "#10b981";

const riskLevelClasses: Record<RiskLevel, string> = {
  low: "border-emerald-400/40 bg-emerald-400/10 text-emerald-100",
  medium: "border-amber-400/40 bg-amber-400/10 text-amber-100",
  high: "border-rose-400/40 bg-rose-400/10 text-rose-100"
};

interface InputFieldProps {
  id: keyof SingleMatchFormState;
  label: string;
  value: string;
  onChange: (field: keyof SingleMatchFormState, value: string) => void;
  helperText?: string;
  inputMode?: "decimal" | "numeric" | "text";
  placeholder?: string;
}

interface WdlChartDatum {
  name: string;
  probability: number;
}

function formatPercent(value: number): string {
  return probabilityFormatter.format(value);
}

function formatDecimal(value: number): string {
  return decimalFormatter.format(value);
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
  value: number | string | readonly (number | string)[] | undefined
): [string, string] {
  const rawValue = isChartValueRange(value) ? value[0] : value;
  const numericValue = typeof rawValue === "number" ? rawValue : Number(rawValue);

  if (!Number.isFinite(numericValue)) {
    return [rawValue === undefined ? "Unavailable" : String(rawValue), "Probability"];
  }

  return [formatPercent(numericValue), "Probability"];
}

function buildWdlRows(
  probabilities: WinDrawLoseProbabilities,
  homeTeam: string,
  awayTeam: string
) {
  return [
    { label: `${homeTeam} win`, value: probabilities.home },
    { label: "Draw", value: probabilities.draw },
    { label: `${awayTeam} win`, value: probabilities.away }
  ];
}

function buildWdlChartData(probabilities: WinDrawLoseProbabilities): WdlChartDatum[] {
  return [
    { name: "Home", probability: probabilities.home },
    { name: "Draw", probability: probabilities.draw },
    { name: "Away", probability: probabilities.away }
  ];
}

function InputField({
  id,
  label,
  value,
  onChange,
  helperText,
  inputMode = "text",
  placeholder
}: InputFieldProps) {
  const helperId = helperText === undefined ? undefined : `${id}-helper`;

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    onChange(id, event.target.value);
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-zinc-200" htmlFor={id}>
        {label}
      </label>
      <input
        aria-describedby={helperId}
        autoComplete="off"
        className="h-11 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-50 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
        id={id}
        inputMode={inputMode}
        name={id}
        onChange={handleChange}
        placeholder={placeholder}
        type="text"
        value={value}
      />
      {helperText === undefined ? null : (
        <p className="text-xs leading-5 text-zinc-400" id={helperId}>
          {helperText}
        </p>
      )}
    </div>
  );
}

export function SingleMatchAnalysis() {
  const [formState, setFormState] = useState<SingleMatchFormState>(defaultSingleMatchFormState);
  const analysis = useMemo(() => buildSingleMatchAnalysis(formState), [formState]);
  const result = analysis.result;
  const wdlRows =
    result === undefined
      ? []
      : buildWdlRows(result.winDrawLoseProbabilities, analysis.homeTeam, analysis.awayTeam);
  const wdlChartData =
    result === undefined ? [] : buildWdlChartData(result.winDrawLoseProbabilities);

  function updateField(field: keyof SingleMatchFormState, value: string): void {
    setFormState((currentFormState) => ({
      ...currentFormState,
      [field]: value
    }));
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
      <form
        className="space-y-6 rounded-lg border border-zinc-800 bg-zinc-900/70 p-5 shadow-2xl shadow-black/20"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <div>
          <h2 className="text-lg font-semibold text-zinc-50">Single-match analysis</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Enter local model inputs to calculate pre-match probabilities.
          </p>
        </div>

        <fieldset className="space-y-4">
          <legend className="text-sm font-semibold uppercase tracking-wide text-emerald-300">
            Match
          </legend>
          <InputField
            id="homeTeam"
            label="Home team name"
            onChange={updateField}
            value={formState.homeTeam}
          />
          <InputField
            id="awayTeam"
            label="Away team name"
            onChange={updateField}
            value={formState.awayTeam}
          />
        </fieldset>

        <fieldset className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <legend className="mb-4 text-sm font-semibold uppercase tracking-wide text-emerald-300">
            Model inputs
          </legend>
          <InputField
            helperText="Use a non-negative number."
            id="homeLambda"
            inputMode="decimal"
            label="Home expected goals lambda"
            onChange={updateField}
            value={formState.homeLambda}
          />
          <InputField
            helperText="Use a non-negative number."
            id="awayLambda"
            inputMode="decimal"
            label="Away expected goals lambda"
            onChange={updateField}
            value={formState.awayLambda}
          />
          <InputField
            helperText="Whole number from 0 upward."
            id="maxGoals"
            inputMode="numeric"
            label="maxGoals"
            onChange={updateField}
            value={formState.maxGoals}
          />
          <InputField
            helperText="Controls how many scorelines are listed."
            id="topScoreLimit"
            inputMode="numeric"
            label="Top score limit"
            onChange={updateField}
            value={formState.topScoreLimit}
          />
        </fieldset>

        <fieldset className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <legend className="mb-4 text-sm font-semibold uppercase tracking-wide text-emerald-300">
            Optional markets
          </legend>
          <InputField
            helperText="Leave blank to hide over/under output."
            id="overUnderLine"
            inputMode="decimal"
            label="Over/under line"
            onChange={updateField}
            placeholder="2.5"
            value={formState.overUnderLine}
          />
          <InputField
            helperText="Decimal odds greater than 1."
            id="marketHomeOdds"
            inputMode="decimal"
            label="Home market odds"
            onChange={updateField}
            value={formState.marketHomeOdds}
          />
          <InputField
            helperText="Decimal odds greater than 1."
            id="marketDrawOdds"
            inputMode="decimal"
            label="Draw market odds"
            onChange={updateField}
            value={formState.marketDrawOdds}
          />
          <InputField
            helperText="Decimal odds greater than 1."
            id="marketAwayOdds"
            inputMode="decimal"
            label="Away market odds"
            onChange={updateField}
            value={formState.marketAwayOdds}
          />
        </fieldset>
      </form>

      <div className="space-y-6">
        <section className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-5">
          <p className="text-sm font-medium text-zinc-200">Safety note</p>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Decision support only. No automatic betting. Model output comes from deterministic local
            calculations.
          </p>
        </section>

        {analysis.validationMessages.length === 0 ? null : (
          <section
            aria-live="polite"
            className="rounded-lg border border-amber-400/40 bg-amber-400/10 p-5"
            role="alert"
          >
            <h2 className="text-base font-semibold text-amber-100">Check inputs</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-amber-50">
              {analysis.validationMessages.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          </section>
        )}

        {result === undefined ? (
          <section className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-5">
            <h2 className="text-lg font-semibold text-zinc-50">Analysis unavailable</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Fix the input messages to run the deterministic match model.
            </p>
          </section>
        ) : (
          <>
            <section className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">
                    Model output
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-zinc-50">
                    {analysis.homeTeam} vs {analysis.awayTeam}
                  </h2>
                </div>
                <p className="text-sm text-zinc-400">maxGoals {analysis.input?.maxGoals}</p>
              </div>

              <dl className="mt-6 grid gap-4 sm:grid-cols-3">
                <div>
                  <dt className="text-sm text-zinc-400">{analysis.homeTeam} xG</dt>
                  <dd className="mt-1 text-2xl font-semibold text-zinc-50">
                    {formatDecimal(result.expectedGoals.home)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-zinc-400">{analysis.awayTeam} xG</dt>
                  <dd className="mt-1 text-2xl font-semibold text-zinc-50">
                    {formatDecimal(result.expectedGoals.away)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-zinc-400">Total xG</dt>
                  <dd className="mt-1 text-2xl font-semibold text-zinc-50">
                    {formatDecimal(result.expectedGoals.total)}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-5">
              <div className="flex flex-col gap-6 lg:flex-row">
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-semibold text-zinc-50">Win / Draw / Lose</h2>
                  <dl className="mt-4 divide-y divide-zinc-800">
                    {wdlRows.map((row) => (
                      <div className="flex items-center justify-between gap-4 py-3" key={row.label}>
                        <dt className="text-sm text-zinc-300">{row.label}</dt>
                        <dd className="text-base font-semibold text-zinc-50">
                          {formatPercent(row.value)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>

                <div aria-label="Win draw lose probability chart" className="h-64 min-w-0 flex-1">
                  <ResponsiveContainer height="100%" width="100%">
                    <BarChart data={wdlChartData} margin={{ bottom: 8, left: 0, right: 8, top: 8 }}>
                      <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        axisLine={false}
                        dataKey="name"
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
                      <Bar dataKey="probability" fill={chartBarColor} radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>

            <SingleMatchReviewPanel
              awayTeam={analysis.awayTeam}
              homeTeam={analysis.homeTeam}
              probabilities={result.winDrawLoseProbabilities}
            />

            <section className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-5">
              <h2 className="text-lg font-semibold text-zinc-50">Top scores</h2>
              <div className="mt-4 overflow-hidden rounded-lg border border-zinc-800">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="bg-zinc-950/70 text-zinc-400">
                    <tr>
                      <th className="px-4 py-3 font-medium" scope="col">
                        Score
                      </th>
                      <th className="px-4 py-3 text-right font-medium" scope="col">
                        Probability
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {result.topScores.map((score) => (
                      <tr key={`${String(score.homeGoals)}-${String(score.awayGoals)}`}>
                        <td className="px-4 py-3 text-zinc-200">
                          {analysis.homeTeam} {score.homeGoals}-{score.awayGoals}{" "}
                          {analysis.awayTeam}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-zinc-50">
                          {formatPercent(score.probability)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {result.overUnderProbabilities === undefined ? null : (
              <section className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-5">
                <h2 className="text-lg font-semibold text-zinc-50">Over / Under</h2>
                <dl className="mt-4 divide-y divide-zinc-800">
                  <div className="flex items-center justify-between gap-4 py-3">
                    <dt className="text-sm text-zinc-300">Over {analysis.input?.overUnderLine}</dt>
                    <dd className="text-base font-semibold text-zinc-50">
                      {formatPercent(result.overUnderProbabilities.over)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 py-3">
                    <dt className="text-sm text-zinc-300">Under {analysis.input?.overUnderLine}</dt>
                    <dd className="text-base font-semibold text-zinc-50">
                      {formatPercent(result.overUnderProbabilities.under)}
                    </dd>
                  </div>
                </dl>
              </section>
            )}

            <OddsComparisonChart result={result} />

            <section className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">
                    Recommendation
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold capitalize text-zinc-50">
                    {result.recommendation.action}
                  </h2>
                </div>
                <span
                  className={`inline-flex w-fit items-center rounded-lg border px-3 py-2 text-sm font-semibold capitalize ${riskLevelClasses[result.recommendation.riskLevel]}`}
                >
                  {result.recommendation.riskLevel} risk
                </span>
              </div>

              <ul className="mt-5 space-y-3 text-sm leading-6 text-zinc-300">
                {result.recommendation.reasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            </section>

            <AIExplanationPanel
              awayTeam={analysis.awayTeam}
              homeTeam={analysis.homeTeam}
              result={result}
            />
          </>
        )}
      </div>
    </div>
  );
}
