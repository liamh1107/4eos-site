"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { setResolve } from "@/components/signal/store";
import { sendSignal } from "@/components/analytics/Beacon";
import {
  AREA_LABEL,
  CATEGORY_COPY,
  QUIZ_QUESTIONS,
  categoryFor,
  scoreQuiz,
  type QuizAnswers,
  type QuizCategory,
  type QuizResult,
} from "@/lib/quiz";
import { IntakeForm } from "./IntakeForm";

const STORAGE = "eos_quiz";
type Stage = "intro" | "quiz" | "result";
type Saved = { stage: Stage; step: number; answers: QuizAnswers; started: boolean; completed: boolean };

const RING_R = 54;
const RING_C = 2 * Math.PI * RING_R;

function load(): Saved | null {
  try {
    const raw = sessionStorage.getItem(STORAGE);
    return raw ? (JSON.parse(raw) as Saved) : null;
  } catch {
    return null;
  }
}

function save(state: Saved) {
  try {
    sessionStorage.setItem(STORAGE, JSON.stringify(state));
  } catch {
    // Storage can be unavailable in private windows. The quiz still works.
  }
}

export function RiskQuiz() {
  const [stage, setStage] = useState<Stage>("intro");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [restored, setRestored] = useState(false);
  const [ticketOpen, setTicketOpen] = useState(false);
  const started = useRef(false);
  const completed = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const saved = load();
    if (saved) {
      setStage(saved.stage);
      setStep(Math.min(saved.step, QUIZ_QUESTIONS.length - 1));
      setAnswers(saved.answers ?? {});
      started.current = saved.started;
      completed.current = saved.completed;
    }
    setRestored(true);
  }, []);

  useEffect(() => {
    if (!restored) return;
    save({ stage, step, answers, started: started.current, completed: completed.current });
  }, [stage, step, answers, restored]);

  const answered = Object.keys(answers).length;
  const progress = stage === "result" ? 1 : answered / QUIZ_QUESTIONS.length;

  useEffect(() => {
    setResolve(progress);
    return () => setResolve(0);
  }, [progress]);

  useEffect(() => {
    if (stage === "quiz") heading.current?.focus({ preventScroll: true });
  }, [stage, step]);

  const result = useMemo(() => (stage === "result" ? scoreQuiz(answers) : null), [stage, answers]);

  const begin = useCallback(() => {
    if (!started.current) {
      started.current = true;
      sendSignal({ name: "quiz_start" });
    }
    setStage("quiz");
  }, []);

  const finish = useCallback(
    (final: QuizAnswers) => {
      const scored = scoreQuiz(final);
      if (!completed.current) {
        completed.current = true;
        sendSignal({ name: "quiz_complete", detail: scored.category, score: scored.score });
      }
      setStage("result");
    },
    [],
  );

  const choose = (index: number) => {
    const question = QUIZ_QUESTIONS[step]!;
    setAnswers((prev) => ({ ...prev, [question.id]: index }));
  };

  const next = () => {
    if (step < QUIZ_QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      finish(answers);
    }
  };

  const restart = () => {
    setAnswers({});
    setStep(0);
    completed.current = false;
    setStage("quiz");
  };

  if (ticketOpen) {
    return (
      <div className="quiz-card">
        <TicketForm onBack={() => setTicketOpen(false)} />
      </div>
    );
  }

  if (stage === "intro") {
    return (
      <div className="quiz-card">
        <p className="micro text-fg-faint">Twelve questions · about three minutes</p>
        <p className="lede mt-4 max-w-[48ch]">
          Six areas: business, cybersecurity, backup, compliance, infrastructure, and support.
          You get a risk score and a short read on each area. Nothing is sent to us unless you
          choose to ask for the full assessment at the end.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <button type="button" onClick={begin} className="bar-btn bar-btn-fill inline-flex">
            Start the self-check <span aria-hidden>→</span>
          </button>
          <button type="button" onClick={() => setTicketOpen(true)} className="bar-btn bar-btn-line inline-flex">
            Submit a ticket
          </button>
        </div>
      </div>
    );
  }

  if (stage === "result" && result) {
    return <Scorecard result={result} onRestart={restart} />;
  }

  const question = QUIZ_QUESTIONS[step]!;
  const picked = answers[question.id];
  const groupId = `quiz-${question.id}`;

  return (
    <div className="quiz-card">
      <div className="flex items-baseline justify-between gap-4">
        <p className="micro text-fg-faint">
          {String(step + 1).padStart(2, "0")} / {String(QUIZ_QUESTIONS.length).padStart(2, "0")}
        </p>
        <p className="micro text-fg-faint">{AREA_LABEL[question.area]}</p>
      </div>
      <div className="quiz-progress mt-3" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}>
        <span style={{ width: `${Math.round(progress * 100)}%` }} />
      </div>
      <h2 ref={heading} id={groupId} tabIndex={-1} className="display mt-8 text-[clamp(1.25rem,2.2vw,1.8rem)] outline-none">
        {question.prompt}
      </h2>
      <div role="radiogroup" aria-labelledby={groupId} className="mt-6 grid gap-2">
        {question.answers.map((answer, i) => {
          const checked = picked === i;
          return (
            <label key={answer.label} className={`quiz-option${checked ? " is-checked" : ""}`}>
              <input
                type="radio"
                name={groupId}
                value={i}
                checked={checked}
                onChange={() => choose(i)}
                className="sr-only"
              />
              <span className="quiz-dot" aria-hidden />
              <span>{answer.label}</span>
            </label>
          );
        })}
      </div>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => (step === 0 ? setStage("intro") : setStep(step - 1))}
          className="bar-btn bar-btn-line inline-flex"
        >
          <span aria-hidden>←</span>&nbsp;Back
        </button>
        <button type="button" onClick={() => setTicketOpen(true)} className="micro text-fg-faint hover:text-gold">
          Submit a ticket instead
        </button>
        <button
          type="button"
          onClick={next}
          disabled={picked === undefined}
          className="bar-btn bar-btn-fill inline-flex disabled:cursor-not-allowed disabled:opacity-30"
        >
          {step === QUIZ_QUESTIONS.length - 1 ? "See the score" : "Next"} <span aria-hidden>→</span>
        </button>
      </div>
    </div>
  );
}

function Scorecard({ result, onRestart }: { result: QuizResult; onRestart: () => void }) {
  const [drawn, setDrawn] = useState(false);
  const [askOpen, setAskOpen] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const tone = toneFor(result.category);
  const offset = RING_C * (1 - (drawn ? result.score : 0) / 100);
  const topic = `Risk quiz: ${result.category} (${result.score}/100)`;

  return (
    <div className="quiz-card" data-tone={tone}>
      <div className="grid gap-10 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="micro text-fg-faint">Your result</p>
          <div className="quiz-ring mt-5" role="img" aria-label={`Risk score ${result.score} out of 100, ${result.category}`}>
            <svg viewBox="0 0 128 128" aria-hidden>
              <circle cx="64" cy="64" r={RING_R} className="quiz-ring-track" />
              <circle
                cx="64"
                cy="64"
                r={RING_R}
                className="quiz-ring-fill"
                strokeDasharray={RING_C}
                strokeDashoffset={offset}
              />
            </svg>
            <div className="quiz-ring-label">
              <span className="display text-[clamp(2rem,4vw,3rem)]">{result.score}</span>
              <span className="micro text-fg-faint">of 100</span>
            </div>
          </div>
          <h2 className="display quiz-category mt-6 text-[clamp(1.4rem,2.6vw,2rem)]">{result.category}</h2>
          <p className="lede mt-4">{CATEGORY_COPY[result.category]}</p>
        </div>
        <div className="md:col-span-7">
          <p className="micro text-fg-faint">By area</p>
          <ul className="mt-5 divide-y divide-hairline border-y border-hairline">
            {result.areas.map((area) => (
              <li key={area.area} className="py-4">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-[15px] tracking-tight">{area.label}</span>
                  <span className="micro text-fg-faint">{area.score}</span>
                </div>
                <div className="quiz-bar mt-2" aria-hidden>
                  <span style={{ width: drawn ? `${area.score}%` : 0 }} data-tone={toneFor(categoryFor(area.score))} />
                </div>
                <p className="body-sm mt-2">{area.note}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-12 border-t border-hairline pt-8">
        {askOpen ? (
          <>
            <p className="micro text-fg-faint">Full assessment</p>
            <p className="lede mt-3 max-w-[52ch]">
              A senior engineer reviews the environment against these six areas and comes back with
              specifics. Your score goes with the request so the conversation starts where you are.
            </p>
            <div className="mt-6 max-w-[40rem]">
              <IntakeForm
                endpoint="/api/contact"
                intent="assessment"
                submitLabel="Request the assessment"
                topic={topic}
                detail="quiz"
                messageLabel="Anything we should know first"
              />
            </div>
          </>
        ) : (
          <div className="flex flex-wrap items-center gap-4">
            <button type="button" onClick={() => setAskOpen(true)} className="bar-btn bar-btn-fill inline-flex">
              Get the full assessment <span aria-hidden>→</span>
            </button>
            <button type="button" onClick={onRestart} className="bar-btn bar-btn-line inline-flex">
              Retake
            </button>
            <Link href="/services" className="micro ml-auto text-fg-faint hover:text-gold">
              What 4EOS covers
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function TicketForm({ onBack }: { onBack: () => void }) {
  return (
    <>
      <p className="micro text-fg-faint">Ticket</p>
      <p className="lede mt-4 max-w-[48ch]">
        Skip the self-check. Tell us what you need and a ticket goes straight to the team.
      </p>
      <div className="mt-6 max-w-[40rem]">
        <IntakeForm
          endpoint="/api/contact"
          intent="assessment"
          submitLabel="Submit the ticket"
          messageLabel="What should we look at"
        />
      </div>
      <button type="button" onClick={onBack} className="bar-btn bar-btn-line mt-8 inline-flex">
        <span aria-hidden>←</span>&nbsp;Back to the self-check
      </button>
    </>
  );
}

function toneFor(category: QuizCategory) {
  switch (category) {
    case "Low Risk":
      return "low";
    case "Moderate Risk":
      return "moderate";
    case "Elevated Risk":
      return "elevated";
    default:
      return "critical";
  }
}
