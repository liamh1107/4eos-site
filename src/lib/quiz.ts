/**
 * The IT Risk Quiz. Twelve questions across six areas. Each answer carries
 * a risk weight from 0 (handled) to 3 (exposed). The total is scaled to a
 * 0..100 risk score and placed in one of four bands.
 *
 * The copy here describes risk in general terms. It does not promise an
 * outcome or cite a figure that is not on the live site.
 */

export const QUIZ_AREAS = [
  "business",
  "cybersecurity",
  "backup",
  "compliance",
  "infrastructure",
  "support",
] as const;

export type QuizArea = (typeof QUIZ_AREAS)[number];

export const AREA_LABEL: Record<QuizArea, string> = {
  business: "Business",
  cybersecurity: "Cybersecurity",
  backup: "Backup and recovery",
  compliance: "Compliance",
  infrastructure: "Infrastructure",
  support: "Support",
};

export type QuizAnswer = { label: string; risk: 0 | 1 | 2 | 3 };

export type QuizQuestion = {
  id: string;
  area: QuizArea;
  prompt: string;
  answers: readonly QuizAnswer[];
};

export const MAX_RISK_PER_ANSWER = 3;

export const QUIZ_QUESTIONS: readonly QuizQuestion[] = [
  {
    id: "owner",
    area: "business",
    prompt: "Who owns IT decisions at the company?",
    answers: [
      { label: "A named leader with a plan and a budget", risk: 0 },
      { label: "A manager who handles it alongside another role", risk: 1 },
      { label: "Whoever is most comfortable with computers", risk: 2 },
      { label: "Nobody in particular", risk: 3 },
    ],
  },
  {
    id: "downtime",
    area: "business",
    prompt: "If the main systems went down for a day, what would happen?",
    answers: [
      { label: "We would switch to a tested fallback and keep working", risk: 0 },
      { label: "We would slow down but keep most work moving", risk: 1 },
      { label: "Most of the team would stop until it came back", risk: 2 },
      { label: "We have not thought about it", risk: 3 },
    ],
  },
  {
    id: "mfa",
    area: "cybersecurity",
    prompt: "Is multi-factor authentication required on email and remote access?",
    answers: [
      { label: "Required everywhere, enforced by policy", risk: 0 },
      { label: "Required on email, optional elsewhere", risk: 1 },
      { label: "Available but most people have not turned it on", risk: 2 },
      { label: "No, or we are not sure", risk: 3 },
    ],
  },
  {
    id: "threats",
    area: "cybersecurity",
    prompt: "How would you learn that a device had been compromised?",
    answers: [
      { label: "Monitoring would catch it and someone would act within the hour", risk: 0 },
      { label: "Antivirus would flag it and we would look when we saw the alert", risk: 1 },
      { label: "A user would notice something odd and tell us", risk: 2 },
      { label: "We probably would not know", risk: 3 },
    ],
  },
  {
    id: "restore",
    area: "backup",
    prompt: "When did you last restore a file or server from backup to prove it works?",
    answers: [
      { label: "Within the last quarter, as a scheduled test", risk: 0 },
      { label: "Within the last year", risk: 1 },
      { label: "Only when something was actually lost", risk: 2 },
      { label: "Never, or we do not know if backups run", risk: 3 },
    ],
  },
  {
    id: "offsite",
    area: "backup",
    prompt: "Where do the backups live?",
    answers: [
      { label: "On site and in a separate location, with versions kept", risk: 0 },
      { label: "In the cloud only, with versions kept", risk: 1 },
      { label: "On a drive or server in the same building", risk: 2 },
      { label: "We rely on files being saved to the cloud by the apps", risk: 3 },
    ],
  },
  {
    id: "framework",
    area: "compliance",
    prompt: "Does the company follow a written security framework or requirement?",
    answers: [
      { label: "Yes, with documented controls and periodic review", risk: 0 },
      { label: "Yes, but the documentation is behind", risk: 1 },
      { label: "We know one applies but have not mapped to it", risk: 2 },
      { label: "No framework or requirement applies that we know of", risk: 3 },
    ],
  },
  {
    id: "audit",
    area: "compliance",
    prompt: "If a client, insurer, or auditor asked for proof of your controls, what would you hand over?",
    answers: [
      { label: "Current policies, reports, and training records", risk: 0 },
      { label: "Some documents; the rest would take a few weeks", risk: 1 },
      { label: "We would have to write most of it", risk: 2 },
      { label: "We would not know where to start", risk: 3 },
    ],
  },
  {
    id: "lifecycle",
    area: "infrastructure",
    prompt: "How old is the oldest server or network device still in daily use?",
    answers: [
      { label: "Under five years, and replacement is scheduled", risk: 0 },
      { label: "Five to seven years", risk: 1 },
      { label: "Older than seven years but still supported", risk: 2 },
      { label: "Past vendor support, or we are not sure", risk: 3 },
    ],
  },
  {
    id: "patching",
    area: "infrastructure",
    prompt: "How are operating system and application updates applied?",
    answers: [
      { label: "Automatically, on a schedule, with reporting", risk: 0 },
      { label: "Automatically on most devices", risk: 1 },
      { label: "When someone remembers or a user clicks update", risk: 2 },
      { label: "Updates are often postponed or turned off", risk: 3 },
    ],
  },
  {
    id: "helpdesk",
    area: "support",
    prompt: "When something breaks, how does the team get help?",
    answers: [
      { label: "A staffed help desk with tracked tickets and response targets", risk: 0 },
      { label: "A named person or vendor, usually same day", risk: 1 },
      { label: "Whoever is available, when they are available", risk: 2 },
      { label: "People work around it or wait", risk: 3 },
    ],
  },
  {
    id: "monitoring",
    area: "support",
    prompt: "Are devices and servers monitored around the clock?",
    answers: [
      { label: "Yes, with alerts acted on 24/7", risk: 0 },
      { label: "Yes during business hours", risk: 1 },
      { label: "Some systems, informally", risk: 2 },
      { label: "No", risk: 3 },
    ],
  },
];

export const QUIZ_CATEGORIES = ["Low Risk", "Moderate Risk", "Elevated Risk", "Critical Risk"] as const;
export type QuizCategory = (typeof QUIZ_CATEGORIES)[number];

export const CATEGORY_COPY: Record<QuizCategory, string> = {
  "Low Risk":
    "The basics are in place: ownership, monitoring, tested backups, and documented controls. The work now is keeping them current as the business changes.",
  "Moderate Risk":
    "Most of the foundation is there, with a few gaps that would slow a recovery or complicate an audit. These are usually quick to close once they are named.",
  "Elevated Risk":
    "Several areas depend on luck or on one person. A single incident could stop work for days. The gaps are known and fixable, but they need an owner and a plan.",
  "Critical Risk":
    "The environment is exposed in more than one area at once. Recovery, security, and support are not yet reliable enough to count on.",
};

export const AREA_NOTE: Record<QuizArea, string> = {
  business: "Who decides, who pays, and what happens when systems stop.",
  cybersecurity: "Identity, detection, and response to a compromised device.",
  backup: "Whether a restore has been proven, and where the copies live.",
  compliance: "Written controls, and the evidence a client or auditor would ask for.",
  infrastructure: "Equipment age and how updates reach every machine.",
  support: "How the team gets help, and whether anyone is watching after hours.",
};

export type QuizAnswers = Record<string, number>;

export type AreaScore = { area: QuizArea; label: string; score: number; note: string };

export type QuizResult = {
  score: number;
  category: QuizCategory;
  areas: AreaScore[];
  answered: number;
};

export function categoryFor(score: number): QuizCategory {
  if (score < 25) return "Low Risk";
  if (score < 50) return "Moderate Risk";
  if (score < 75) return "Elevated Risk";
  return "Critical Risk";
}

/** Score the answered questions. Unanswered questions are left out of the scale. */
export function scoreQuiz(answers: QuizAnswers): QuizResult {
  let total = 0;
  let max = 0;
  let answered = 0;
  const perArea = new Map<QuizArea, { risk: number; max: number }>();

  for (const question of QUIZ_QUESTIONS) {
    const index = answers[question.id];
    const answer = typeof index === "number" ? question.answers[index] : undefined;
    const bucket = perArea.get(question.area) ?? { risk: 0, max: 0 };
    if (answer) {
      total += answer.risk;
      max += MAX_RISK_PER_ANSWER;
      bucket.risk += answer.risk;
      bucket.max += MAX_RISK_PER_ANSWER;
      answered += 1;
    }
    perArea.set(question.area, bucket);
  }

  const score = max ? Math.round((total / max) * 100) : 0;
  const areas = QUIZ_AREAS.map((area) => {
    const bucket = perArea.get(area) ?? { risk: 0, max: 0 };
    return {
      area,
      label: AREA_LABEL[area],
      score: bucket.max ? Math.round((bucket.risk / bucket.max) * 100) : 0,
      note: AREA_NOTE[area],
    };
  });

  return { score, category: categoryFor(score), areas, answered };
}

export function isQuizCategory(value: unknown): value is QuizCategory {
  return typeof value === "string" && (QUIZ_CATEGORIES as readonly string[]).includes(value);
}
