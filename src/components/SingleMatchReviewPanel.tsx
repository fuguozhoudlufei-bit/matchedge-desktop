import { useMemo, useState, type ChangeEvent } from "react";

import type { MatchOutcome, OutcomeProbabilities } from "../lib/review";
import {
  buildSingleMatchReview,
  defaultSingleMatchReviewFormState,
  type ReviewPredictionSelection,
  type SingleMatchReviewFormState
} from "./singleMatchReviewForm";

const brierScoreFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3
});

interface SingleMatchReviewPanelProps {
  awayTeam: string;
  homeTeam: string;
  probabilities: OutcomeProbabilities;
}

interface ReviewGoalInputProps {
  field: "homeGoals" | "awayGoals";
  label: string;
  onChange: (field: "homeGoals" | "awayGoals", value: string) => void;
  value: string;
}

function formatOutcome(outcome: MatchOutcome, homeTeam: string, awayTeam: string): string {
  if (outcome === "home") {
    return `${homeTeam} win`;
  }

  if (outcome === "away") {
    return `${awayTeam} win`;
  }

  return "Draw";
}

function formatBrierScore(value: number): string {
  return brierScoreFormatter.format(value);
}

function ReviewGoalInput({ field, label, onChange, value }: ReviewGoalInputProps) {
  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    onChange(field, event.target.value);
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-zinc-200" htmlFor={`review-${field}`}>
        {label}
      </label>
      <input
        autoComplete="off"
        className="h-11 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-50 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
        id={`review-${field}`}
        inputMode="numeric"
        name={field}
        onChange={handleChange}
        type="text"
        value={value}
      />
    </div>
  );
}

export function SingleMatchReviewPanel({
  awayTeam,
  homeTeam,
  probabilities
}: SingleMatchReviewPanelProps) {
  const [formState, setFormState] = useState<SingleMatchReviewFormState>(
    defaultSingleMatchReviewFormState
  );
  const review = useMemo(
    () => buildSingleMatchReview(formState, probabilities),
    [formState, probabilities]
  );

  function updateGoalField(field: "homeGoals" | "awayGoals", value: string): void {
    setFormState((currentFormState) => ({
      ...currentFormState,
      [field]: value
    }));
  }

  function updatePredictionSelection(event: ChangeEvent<HTMLSelectElement>): void {
    setFormState((currentFormState) => ({
      ...currentFormState,
      predictedOutcome: event.target.value as ReviewPredictionSelection
    }));
  }

  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">
            Post-match review
          </p>
          <h2 className="mt-2 text-lg font-semibold text-zinc-50">90-minute result check</h2>
        </div>
        <p className="text-sm text-zinc-400">
          Default: {formatOutcome(review.modelTopOutcome, homeTeam, awayTeam)}
        </p>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <ReviewGoalInput
          field="homeGoals"
          label={`${homeTeam} goals`}
          onChange={updateGoalField}
          value={formState.homeGoals}
        />
        <ReviewGoalInput
          field="awayGoals"
          label={`${awayTeam} goals`}
          onChange={updateGoalField}
          value={formState.awayGoals}
        />
        <div className="space-y-2">
          <label className="block text-sm font-medium text-zinc-200" htmlFor="review-prediction">
            Prediction direction
          </label>
          <select
            className="h-11 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-50 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
            id="review-prediction"
            name="predictedOutcome"
            onChange={updatePredictionSelection}
            value={formState.predictedOutcome}
          >
            <option value="modelTop">
              Highest probability ({formatOutcome(review.modelTopOutcome, homeTeam, awayTeam)})
            </option>
            <option value="home">{formatOutcome("home", homeTeam, awayTeam)}</option>
            <option value="draw">Draw</option>
            <option value="away">{formatOutcome("away", homeTeam, awayTeam)}</option>
          </select>
        </div>
      </div>

      {review.validationMessages.length === 0 ? null : (
        <div
          aria-live="polite"
          className="mt-5 rounded-lg border border-amber-400/40 bg-amber-400/10 p-4"
          role="alert"
        >
          <h3 className="text-sm font-semibold text-amber-100">Check review inputs</h3>
          <ul className="mt-2 space-y-1 text-sm leading-6 text-amber-50">
            {review.validationMessages.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </div>
      )}

      {review.result === undefined ? (
        <p className="mt-5 text-sm leading-6 text-zinc-400">
          Enter the actual 90-minute score to calculate review metrics.
        </p>
      ) : (
        <div className="mt-5 space-y-5">
          <dl className="grid gap-4 sm:grid-cols-4">
            <div>
              <dt className="text-sm text-zinc-400">Actual outcome</dt>
              <dd className="mt-1 text-lg font-semibold text-zinc-50">
                {formatOutcome(review.result.actualOutcome, homeTeam, awayTeam)}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-zinc-400">Prediction</dt>
              <dd className="mt-1 text-lg font-semibold text-zinc-50">
                {formatOutcome(review.result.predictedOutcome, homeTeam, awayTeam)}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-zinc-400">Prediction hit</dt>
              <dd className="mt-1 text-lg font-semibold text-zinc-50">
                {review.result.predictionHit ? "Hit" : "Miss"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-zinc-400">Brier score</dt>
              <dd className="mt-1 text-lg font-semibold text-zinc-50">
                {formatBrierScore(review.result.brierScore)}
              </dd>
            </div>
          </dl>
          <p className="text-sm leading-6 text-zinc-300">{review.result.summary}</p>
        </div>
      )}
    </section>
  );
}
