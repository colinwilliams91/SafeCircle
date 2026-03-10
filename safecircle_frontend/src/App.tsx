import { useMemo, useRef, useState } from "react";
import { predictSafety } from "./api/safecircle";
import type { RiskLevel } from "./api/safecircle";
import { inferReasons, normalizePredictResponse, riskLevelFrom } from "./lib/reasons";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { Tabs } from "./ui/Tabs";
import type { TabId } from "./ui/Tabs";

type AnalysisState =
  | { status: "idle" }
  | { status: "loading" }
  | {
      status: "ready";
      labelName: string;
      unsafeScore: number | null;
      riskCategory: string;
      riskLevel: RiskLevel;
      reasons: string[];
    }
  | { status: "error"; message: string };

const SAFE_EXAMPLE = "thanks for your help, see you at school tomorrow";
const UNSAFE_EXAMPLE = "meet me after school and don't tell your parents";
const BULLYING_EXAMPLE = "nobody likes you and you are worthless";

const PRESET_SAFE = {
  labelName: "safe",
  unsafeScore: 0.08,
  riskCategory: "none",
  reasons: [
    "no strong harmful pattern detected",
    "supportive, non-risky language",
  ],
};

const PRESET_UNSAFE = {
  labelName: "unsafe",
  unsafeScore: 0.86,
  riskCategory: "grooming_or_coercion",
  reasons: [
    "secrecy request",
    "isolated meetup suggestion",
    "potential coercive pattern",
  ],
};

const PRESET_BULLY = {
  labelName: "unsafe",
  unsafeScore: 0.74,
  riskCategory: "bullying_or_harassment",
  reasons: ["harassment / bullying language", "demeaning or hostile tone"],
};

function RiskMeter({
  level,
  score,
}: {
  level: RiskLevel;
  score: number | null;
}) {
  const pct =
    score === null
      ? level === "high"
        ? 0.86
        : level === "medium"
          ? 0.62
          : 0.24
      : score;
  const stop =
    level === "high"
      ? { a: "from-rose-300", b: "to-rose-500" }
      : level === "medium"
        ? { a: "from-amber-200", b: "to-amber-400" }
        : { a: "from-emerald-200", b: "to-emerald-400" };

  return (
    <div className="rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/10">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold tracking-wide text-slate-300">
            Risk level
          </div>
          <div className="mt-1 text-sm text-slate-200">
            {score === null ? "N/A" : `${Math.round(pct * 100)}%`}
            <span className="ml-2 text-xs text-slate-400">
              (privacy-preserving score)
            </span>
          </div>
        </div>
        <div className="rounded-full bg-white/6 px-3 py-1 text-xs font-semibold text-slate-200 ring-1 ring-white/10">
          {level.toUpperCase()}
        </div>
      </div>
      <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-white/6 ring-1 ring-white/10">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${stop.a} ${stop.b}`}
          style={{
            width: `${Math.max(6, Math.min(100, Math.round(pct * 100)))}%`,
          }}
        />
      </div>
    </div>
  );
}

function SignalPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-white/6 px-3 py-1 text-xs font-semibold text-slate-200 ring-1 ring-white/10">
      <span className="h-1.5 w-1.5 rounded-full bg-sky-300/80" />
      {children}
    </span>
  );
}

export default function App() {
  const [tab, setTab] = useState<TabId>("chat");
  const [message, setMessage] = useState(UNSAFE_EXAMPLE);
  const [analysis, setAnalysis] = useState<AnalysisState>({ status: "idle" });
  const [actionNote, setActionNote] = useState<string>("No action selected.");
  const safetyPanelRef = useRef<HTMLDivElement | null>(null);
  const [exampleNote, setExampleNote] = useState<string>(
    "Pick an example to load a realistic message.",
  );
  const [guardianNote, setGuardianNote] = useState<string>(
    "Demo data shown. Click refresh to pull from backend.",
  );
  const [guardianLoading, setGuardianLoading] = useState(false);
  const guardianData: {
    currentRiskLevel: RiskLevel;
    recentSignals: string[];
    privacyNotes: string[];
  } = {
    currentRiskLevel: "medium",
    recentSignals: [
      "Repeated harassment language detected",
      "Possible coercive behavior pattern",
      "Potential unsafe meetup suggestion",
    ],
    privacyNotes: [
      "No full transcript access",
      "No message-by-message surveillance",
      "Consent-based escalation options",
      "Pattern summaries instead of private content exposure",
    ],
  };

  function guardianCopy(level: RiskLevel) {
    if (level === "high") {
      return "High risk detected. Consider immediate support and guidance without exposing full transcripts.";
    }
    if (level === "medium") {
      return "Moderate risk detected. Monitor patterns and check in with the child.";
    }
    return "Low risk detected. No immediate action needed, keep supportive check-ins.";
  }

  const childTranscript = useMemo(
    () => [
      { from: "other", text: "can you keep a secret?", time: "3:42 PM" },
      { from: "me", text: "maybe... what is it?", time: "3:43 PM" },
      { from: "other", text: "meet me after school, don’t tell anyone", time: "3:45 PM" },
    ],
    [],
  );

  function applyExample(
    text: string,
    note: string,
    preset: {
      labelName: string;
      unsafeScore: number;
      reasons: string[];
      riskCategory: string;
    },
  ) {
    setMessage(text);
    setExampleNote(note);
    setAnalysis({
      status: "ready",
      labelName: preset.labelName,
      unsafeScore: preset.unsafeScore,
      reasons: preset.reasons,
      riskCategory: preset.riskCategory,
      riskLevel: riskLevelFrom(preset.labelName, preset.unsafeScore),
    });
  }

  async function onAnalyze() {
    const text = message.trim();
    if (!text) return;

    setAnalysis({ status: "loading" });
    try {
      const data = await predictSafety({ text });
      const normalized = normalizePredictResponse(data);
      const serverReasons = normalized.reasons;
      const fallbackReasons = inferReasons(text, normalized.labelName);
      const reasons =
        serverReasons.length > 0 ? serverReasons : fallbackReasons;
      const riskLevel = riskLevelFrom(
        normalized.labelName,
        normalized.unsafeScore,
      );

      setAnalysis({
        status: "ready",
        labelName: normalized.labelName,
        unsafeScore: normalized.unsafeScore,
        reasons,
        riskCategory: normalized.riskCategory,
        riskLevel,
      });
    } catch {
      setAnalysis({
        status: "error",
        message:
          "Could not reach the backend. Make sure the API is running on port 8000.",
      });
    }
  }


  function handleChildSubmit() {
    if (safetyPanelRef.current) {
      safetyPanelRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }

  function toneFromRiskLevel(level: RiskLevel) {
    if (level === "high") return "high" as const;
    if (level === "medium") return "medium" as const;
    return "safe" as const;
  }

  async function actionIgnore() {
    setActionNote("Action selected: Ignore. No data is shared.");
  }

  async function actionLearn() {
    setActionNote(
      "Action selected: Learn More. The user sees a privacy explanation and safety tips.",
    );
    setTab("privacy");
  }

  async function actionReport() {
    setActionNote(
      "Action selected: Report Anonymously. Only minimal safety signals would be shared, not the full transcript.",
    );
  }

  async function actionNotifyGuardian() {
    setActionNote(
      "Action selected: Notify guardian with privacy summary. Only risk patterns are shared.",
    );
  }

  async function refreshGuardian() {
    setGuardianLoading(true);
    setGuardianNote("Refreshing from backend...");
    try {
      const text = message.trim();
      if (!text) {
        setGuardianNote("No message to analyze.");
        return;
      }
      const data = await predictSafety({ text });
      const normalized = normalizePredictResponse(data);
      const serverReasons = normalized.reasons;
      const fallbackReasons = inferReasons(text, normalized.labelName);
      const reasons =
        serverReasons.length > 0 ? serverReasons : fallbackReasons;
      const riskLevel = riskLevelFrom(
        normalized.labelName,
        normalized.unsafeScore,
      );

      setAnalysis({
        status: "ready",
        labelName: normalized.labelName,
        unsafeScore: normalized.unsafeScore,
        reasons,
        riskCategory: normalized.riskCategory,
        riskLevel,
      });

      setGuardianNote(guardianCopy(riskLevel));
    } catch {
      setGuardianNote("Backend unavailable. Showing demo data.");
    } finally {
      setGuardianLoading(false);
    }
  }

  const headerBadge =
    analysis.status === "ready"
      ? {
          tone: toneFromRiskLevel(analysis.riskLevel),
          text: `Risk: ${analysis.riskLevel.toUpperCase()}`,
        }
      : analysis.status === "loading"
        ? { tone: "neutral" as const, text: "Analyzing" }
        : analysis.status === "error"
          ? { tone: "danger" as const, text: "API error" }
          : { tone: "neutral" as const, text: "Awaiting analysis" };

  const panelText =
    analysis.status === "ready"
      ? analysis.labelName === "unsafe"
        ? `Potential harmful pattern detected. Unsafe score: ${analysis.unsafeScore !== null ? analysis.unsafeScore.toFixed(3) : "N/A"}`
        : `No strong harmful pattern detected. Unsafe score: ${analysis.unsafeScore !== null ? analysis.unsafeScore.toFixed(3) : "N/A"}`
      : analysis.status === "error"
        ? analysis.message
        : "The system will analyze the message and generate a privacy-preserving safety signal.";

  const tabSubtitle =
    tab === "child"
      ? "Child view: simple chat experience with safe choices."
      : tab === "chat"
      ? "Parent view: review risk summaries without reading full chats."
        : tab === "privacy"
          ? "See how privacy is preserved end-to-end."
          : "Guardian view shows trends, not transcripts.";

  const reasons =
    analysis.status === "ready"
      ? analysis.reasons
      : analysis.status === "loading"
        ? ["Contacting API..."]
        : analysis.status === "error"
          ? ["Backend not available"]
          : ["No analysis yet"];

  function renderSafetyPanel(showAdminActions: boolean) {
    return (
      <Card className="sc-glow sc-sheen">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Safety Panel</h2>
          <Badge
            tone={
              analysis.status === "ready"
                ? toneFromRiskLevel(analysis.riskLevel)
                : headerBadge.tone
            }
          >
            {analysis.status === "ready"
              ? `Risk level: ${analysis.riskLevel}`
              : analysis.status === "loading"
                ? "Analyzing"
                : analysis.status === "error"
                  ? "API error"
                  : "Awaiting analysis"}
          </Badge>
        </div>

        <p className="mt-3 text-sm text-slate-300">{panelText}</p>

        <div className="mt-4">
          <RiskMeter
            level={analysis.status === "ready" ? analysis.riskLevel : "medium"}
            score={analysis.status === "ready" ? analysis.unsafeScore : null}
          />
        </div>

        <div className="mt-5 rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/10">
          <div className="text-sm font-semibold text-slate-200">Why flagged</div>
          <ul className="mt-2 space-y-1 text-sm text-slate-300">
            {reasons.map((r) => (
              <li key={r} className="flex items-start gap-2">
                <span className="mt-2 h-1 w-1 flex-none rounded-full bg-slate-400/70" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>

        {showAdminActions ? (
          <>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Button tone="danger" type="button" onClick={actionIgnore}>
                Block
              </Button>
              <Button type="button" onClick={actionIgnore}>
                Ignore
              </Button>
            </div>
            <p className="mt-3 text-xs text-slate-400">{actionNote}</p>
          </>
        ) : null}
      </Card>
    );
  }

  return (
    <div className="sc-bg min-h-screen text-slate-100">
      <div className="sc-grain min-h-screen">
        <div className="w-full px-5 py-10">
          <header className="mx-auto w-full max-w-none text-center">
            <div className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-6">
              <div className="mx-auto flex w-full max-w-none flex-col items-center">
                <h1 className="sc-title w-full text-center text-5xl font-semibold">
                  Safe Circle
                </h1>
                <p className="mt-3 max-w-3xl text-center text-sm text-slate-300">
                  Privacy-first youth safety: detect risky patterns locally,
                  share only minimal risk signals with consent, and give
                  guardians trend summaries without exposing chats.
                </p>
              </div>

              <div>
                <Tabs value={tab} onChange={setTab} />
                <div className="mt-4 text-xs text-slate-400">
                  API endpoint:{" "}
                  <span className="font-semibold text-slate-300">
                    http://127.0.0.1:8000/predict
                  </span>
                </div>
                <div className="mt-3 text-base font-medium text-slate-200">
                  {tabSubtitle}
                </div>
              </div>
            </div>
          </header>

          <main className="mx-auto mt-10 w-full max-w-6xl">
            {tab === "child" ? (
              <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
                <Card className="sc-glow sc-sheen">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold">Child Chat</h2>
                      <p className="mt-1 text-xs text-slate-400">
                        A simple chat view from the child’s perspective.
                      </p>
                    </div>
                    <div className="rounded-xl bg-white/6 px-3 py-2 text-xs text-slate-300 ring-1 ring-white/10">
                      Safety first
                      <div className="mt-0.5 text-[11px] text-slate-400">
                        kid-friendly UI
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-3xl bg-gradient-to-b from-white/[0.06] to-white/[0.03] p-4 ring-1 ring-white/10">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-semibold tracking-wide text-slate-300">
                        Chat simulation
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Example conversation
                      </div>
                    </div>
                    <div className="mt-3 space-y-3">
                      {childTranscript.map((m, i) => (
                        <div key={i} className="flex">
                          <div
                            className={[
                              "max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                              m.from === "other"
                                ? "bg-white/7 ring-1 ring-white/10"
                                : "ml-auto bg-sky-400/10 ring-1 ring-sky-200/10",
                            ].join(" ")}
                          >
                            <div className="flex items-center justify-between gap-3 text-[11px] text-slate-400">
                              <span>{m.from === "other" ? "Friend" : "You"}</span>
                              <span>{m.time}</span>
                            </div>
                            <div className="mt-1 text-sm text-slate-100">
                              {m.text}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="flex items-center justify-between gap-3">
                      <label
                        htmlFor="message"
                        className="text-sm font-semibold text-slate-200"
                      >
                        Try a message
                      </label>
                      <span className="text-xs text-slate-400">
                        Safe options encouraged
                      </span>
                    </div>
                    <textarea
                      id="message"
                      className="mt-2 h-24 w-full resize-none rounded-2xl bg-white/6 px-4 py-3 text-sm text-slate-100 ring-1 ring-white/10 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-300/50"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type a message to analyze..."
                    />
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        tone="primary"
                        onClick={() => {
                          void onAnalyze();
                          handleChildSubmit();
                        }}
                      >
                        Analyze safety
                      </Button>
                      <Button
                        onClick={() =>
                          applyExample(
                            SAFE_EXAMPLE,
                            "Safe example loaded: supportive, non-risky language.",
                            PRESET_SAFE,
                          )
                        }
                        type="button"
                      >
                        Safe example
                      </Button>
                      <Button
                        onClick={() =>
                          applyExample(
                            UNSAFE_EXAMPLE,
                            "Unsafe example loaded: secrecy request + meeting suggestion.",
                            PRESET_UNSAFE,
                          )
                        }
                        type="button"
                      >
                        Unsafe example
                      </Button>
                      <Button
                        onClick={() =>
                          applyExample(
                            BULLYING_EXAMPLE,
                            "Bullying example loaded: harassment language detected.",
                            PRESET_BULLY,
                          )
                        }
                        type="button"
                      >
                        Bullying example
                      </Button>
                    </div>
                    <div className="mt-3 text-xs text-slate-400">
                      {exampleNote}
                    </div>
                  </div>
                </Card>

                <div ref={safetyPanelRef}>
                  {renderSafetyPanel(false)}
                  <div className="mt-4 rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/10">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold text-slate-200">
                        What do you want to do?
                      </div>
                      <SignalPill>minimal disclosure</SignalPill>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button type="button" onClick={actionIgnore}>
                        Ignore
                      </Button>
                      <Button type="button" onClick={actionLearn}>
                        Learn more
                      </Button>
                      <Button tone="danger" type="button" onClick={actionReport}>
                        Report anonymously
                      </Button>
                      <Button type="button" onClick={actionNotifyGuardian}>
                        Notify guardian
                      </Button>
                    </div>
                    <p className="mt-3 text-xs text-slate-400">
                      {actionNote}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {tab === "chat" ? (
              <div className="mx-auto max-w-3xl">
                {renderSafetyPanel(true)}
                <div className="mt-4 text-center text-xs text-slate-400">
                  Parent view: safety panel only.
                </div>
              </div>
            ) : null}

            {tab === "privacy" ? (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="sc-title text-3xl font-semibold">
                    Why you can trust the warning
                  </h2>
                  <p className="mt-2 text-sm text-slate-300">
                    The product story is simple: detect risk locally, share only
                    privacy-preserving signals, and let the user choose what
                    happens next.
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <SignalPill>local inference</SignalPill>
                    <SignalPill>federated AI</SignalPill>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="sc-glow sc-sheen">
                    <h3 className="text-lg font-semibold">Processed Locally</h3>
                    <p className="mt-2 text-sm text-slate-300">
                      Messages are analyzed on-device. The frontend sends text
                      to a demo endpoint, but the architecture goal is to avoid
                      centralized transcript collection.
                    </p>
                  </Card>

                  <Card className="sc-glow sc-sheen">
                    <h3 className="text-lg font-semibold">
                      No Central Chat Storage
                    </h3>
                    <p className="mt-2 text-sm text-slate-300">
                      Guardian guidance is trend-based. The system should not
                      provide message-by-message surveillance.
                    </p>
                  </Card>

                  <Card className="sc-glow sc-sheen">
                    <h3 className="text-lg font-semibold">
                      Minimal Disclosure Reporting
                    </h3>
                    <p className="mt-2 text-sm text-slate-300">
                      Reports can send only category, confidence, and a
                      timestamp bucket. No transcript needed.
                    </p>
                  </Card>

                  <Card className="sc-glow sc-sheen">
                    <h3 className="text-lg font-semibold">
                      Consent-Based Escalation
                    </h3>
                    <p className="mt-2 text-sm text-slate-300">
                      The innovation is not just detection. It is safe
                      escalation without forcing surveillance.
                    </p>
                  </Card>
                </div>

                <div className="flex justify-center pt-4">
                  <Button
                    tone="primary"
                    onClick={() => setTab("child")}
                    type="button"
                  >
                    Try the demo
                  </Button>
                </div>
              </div>
            ) : null}

            {tab === "guardian" ? (
              <div className="grid gap-5 lg:grid-cols-2">
                <Card className="sc-glow sc-sheen">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold">
                      Guardian Safety Overview
                    </h2>
                    <Badge
                      tone={toneFromRiskLevel(
                        analysis.status === "ready"
                          ? analysis.riskLevel
                          : guardianData.currentRiskLevel,
                      )}
                    >
                      Current risk:{" "}
                      {analysis.status === "ready"
                        ? analysis.riskLevel
                        : guardianData.currentRiskLevel}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-300">
                    {analysis.status === "ready"
                      ? guardianCopy(analysis.riskLevel)
                      : guardianNote}
                  </p>
                  <ul className="mt-4 space-y-2 text-sm text-slate-300">
                    {(analysis.status === "ready" && analysis.reasons.length > 0
                      ? analysis.reasons
                      : guardianData.recentSignals
                    ).map((s) => (
                      <li key={s} className="flex items-start gap-2">
                        <span className="mt-2 h-1 w-1 flex-none rounded-full bg-slate-400/70" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <Button
                      tone="primary"
                      onClick={refreshGuardian}
                      disabled={guardianLoading}
                      type="button"
                    >
                      Refresh from backend
                    </Button>
                    <span className="text-xs text-slate-400">
                      {guardianLoading ? "Refreshing..." : "Pulling from /predict"}
                    </span>
                  </div>
                </Card>

                <Card className="sc-glow sc-sheen">
                  <h2 className="text-lg font-semibold">Privacy Protections</h2>
                  <ul className="mt-4 space-y-2 text-sm text-slate-300">
                    {guardianData.privacyNotes.map((s) => (
                      <li key={s} className="flex items-start gap-2">
                        <span className="mt-2 h-1 w-1 flex-none rounded-full bg-slate-400/70" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 text-xs text-slate-400">
                    This view is intended to support guardians without
                    normalizing invasive monitoring. No message-by-message
                    transcript access.
                  </p>
                </Card>
              </div>
            ) : null}
          </main>

          <footer className="mt-10 text-xs text-slate-500">
            Backend connection points: `POST /predict`, `POST
            /reports/anonymous`, `POST /guardian/notify`, `GET
            /guardian/overview`.
          </footer>
        </div>
      </div>
    </div>
  );
}
