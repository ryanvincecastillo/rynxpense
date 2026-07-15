/**
 * RynxTone — centralized Taglish product voice.
 * Humor lives HERE only. TripImpactEngine stays silent / literal.
 *
 * Voice: financially responsible Filipino travel friend —
 * supportive, slightly mapang-asar. Short, witty, conversational.
 */

import type { AffordVerdict } from "./impact-engine";
import type { TripMoneyStatus } from "./money-model";

export type RynxTone =
  | "calm"
  | "playful"
  | "warning"
  | "celebration"
  | "pain";

export type RynxCopyContext =
  | "afford.fits"
  | "afford.tradeoff"
  | "afford.does_not_fit"
  | "status.safe"
  | "status.tight"
  | "status.over_budget"
  | "status.unknown"
  | "breathing.positive"
  | "breathing.zero"
  | "breathing.negative"
  | "free_to_spend.has_room"
  | "free_to_spend.empty"
  | "find_cuts.intro"
  | "find_cuts.none"
  | "price.found_better"
  | "price.found_worse"
  | "expense.logged"
  | "empty.timeline"
  | "empty.expenses"
  | "loading.trip"
  | "loading.checking";

type CatalogEntry = {
  tone: RynxTone;
  variants: string[];
};

/**
 * Curated approved copy. Deterministic pick via stable hash — no LLM.
 * Peso facts must be rendered separately in UI; these lines are support only.
 */
export const RYNX_COPY: Record<RynxCopyContext, CatalogEntry> = {
  "afford.fits": {
    tone: "celebration",
    variants: [
      "Kaya yan. Basta wag ka lang magastos. 😌",
      "May breathing room pa. Wag mo lang ubusin dahil nakita mo 'to.",
      "Technically, yes. Emotionally, bahala ka. 😂",
      "Green light. Pero behave pa rin ha.",
    ],
  },
  "afford.tradeoff": {
    tone: "playful",
    variants: [
      "Pwede… pero may isasakripisyo tayo. 👀",
      "Sige. Hanapan natin ng pwedeng isakripisyo.",
      "Kasya — kung handa kang mag-let go ng ibang plano.",
      "May tradeoff. Hindi libre ang whim purchase, beh.",
    ],
  },
  "afford.does_not_fit": {
    tone: "pain",
    variants: [
      "Beh, hindi kasya. 😭",
      "Wala na tayong mapiga. Budget na talaga ang problema. 😭",
      "Ubos na ang happy money. Behave muna.",
      "Hindi yan whim — yan ay financial self-sabotage.",
    ],
  },
  "status.safe": {
    tone: "calm",
    variants: [
      "Steady pa ang trip. Keep it that way.",
      "Budget mo, kaibigan ka pa.",
      "Safe zone. Wag mong gawing escape room.",
    ],
  },
  "status.tight": {
    tone: "warning",
    variants: [
      "Konti na lang ang breathing room. Chill muna sa shopping.",
      "Tight na. Isang unplanned dinner away from drama.",
      "Hindi pa over — pero close na. Tipid mode on.",
    ],
  },
  "status.over_budget": {
    tone: "pain",
    variants: [
      "Over budget na tayo. Maghanap tayo ng cuts.",
      "Lumampas na. Hindi ito vibes — ito ay math.",
      "Budget breached. Time to negotiate with your future self.",
    ],
  },
  "status.unknown": {
    tone: "calm",
    variants: [
      "Kulangan pa ang flight o hotel estimate. Tapusin muna natin yan.",
      "Hindi pa complete ang picture. I-lock muna ang big tickets.",
    ],
  },
  "breathing.positive": {
    tone: "calm",
    variants: [
      "May breathing room pa. Wag mo lang ubusin dahil nakita mo 'to.",
      "May pad buffer. Protektahan mo.",
    ],
  },
  "breathing.zero": {
    tone: "warning",
    variants: [
      "Zero breathing room. Exact fit — walang margin for chaos.",
      "Sakto lang. Isang whim away from over.",
    ],
  },
  "breathing.negative": {
    tone: "pain",
    variants: [
      "Negative breathing room. Plan > budget. Mag-adjust tayo.",
      "Hindi kasya ang plano sa pera. Pick your battles.",
    ],
  },
  "free_to_spend.has_room": {
    tone: "playful",
    variants: [
      "Ito ang free-to-spend mo. Happy money — with adult supervision.",
      "Pwede kang mag-extra… hanggang dito lang ha.",
    ],
  },
  "free_to_spend.empty": {
    tone: "warning",
    variants: [
      "Ubos na ang happy money. Behave muna.",
      "Walang free-to-spend. Stick to the plan.",
    ],
  },
  "find_cuts.intro": {
    tone: "playful",
    variants: [
      "Sige. Hanapan natin ng pwedeng isakripisyo.",
      "Cut list incoming. Walang personalan — budget lang.",
    ],
  },
  "find_cuts.none": {
    tone: "pain",
    variants: [
      "Wala na tayong mapiga. Budget na talaga ang problema. 😭",
      "Fixed costs dominate. Raising the budget is the real move.",
    ],
  },
  "price.found_better": {
    tone: "celebration",
    variants: [
      "Mas mura! Booking this would help breathing room.",
      "Good find. Evidence lang muna — book when ready.",
    ],
  },
  "price.found_worse": {
    tone: "warning",
    variants: [
      "Mas mahal sa estimate. Check before you commit.",
      "Found price is higher. Breathe. Don't panic-book.",
    ],
  },
  "expense.logged": {
    tone: "celebration",
    variants: [
      "Logged. Budget updated. Proud of you for tracking.",
      "Noted. One less surprise later.",
    ],
  },
  "empty.timeline": {
    tone: "playful",
    variants: [
      "Walang money moves pa. Check a purchase — that's the fun part.",
      "Timeline empty. Mag-desisyon ka para may chismis ang budget.",
    ],
  },
  "empty.expenses": {
    tone: "calm",
    variants: [
      "No expenses yet. Magandang umpisa — stay honest later.",
      "Clean slate. Log spend as it happens.",
    ],
  },
  "loading.trip": {
    tone: "playful",
    variants: [
      "Kinakalkula ang kapalaran ng wallet mo…",
      "Sandali — tinatrack ang pesos.",
    ],
  },
  "loading.checking": {
    tone: "playful",
    variants: [
      "Tinitingnan kung afford…",
      "Math muna, emotions later.",
    ],
  },
};

/** Contexts where humor is forbidden (UI should use literal system copy). */
export const RYNX_NO_JOKE_CONTEXTS = [
  "auth.error",
  "payment.error",
  "privacy",
  "security",
  "destructive.confirm",
  "system.failure",
] as const;

function stableHash(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function pickRynxCopy(
  context: RynxCopyContext,
  salt = "",
): { tone: RynxTone; text: string } {
  const entry = RYNX_COPY[context];
  const idx = stableHash(`${context}:${salt}`) % entry.variants.length;
  return { tone: entry.tone, text: entry.variants[idx]! };
}

export function affordContext(verdict: AffordVerdict): RynxCopyContext {
  if (verdict === "FITS") return "afford.fits";
  if (verdict === "POSSIBLE_WITH_TRADEOFF") return "afford.tradeoff";
  return "afford.does_not_fit";
}

export function statusContext(status: TripMoneyStatus): RynxCopyContext {
  switch (status) {
    case "SAFE":
      return "status.safe";
    case "TIGHT":
      return "status.tight";
    case "OVER_BUDGET":
      return "status.over_budget";
    default:
      return "status.unknown";
  }
}

export function breathingContext(breathingRoom: number): RynxCopyContext {
  if (breathingRoom > 0) return "breathing.positive";
  if (breathingRoom === 0) return "breathing.zero";
  return "breathing.negative";
}

/** Optional spicy line when amount looks wild — still supporting copy only. */
export function spicyAmountLine(amountPhp: number, salt = ""): string | null {
  if (amountPhp < 25_000) return null;
  const lines = [
    `₱${amountPhp.toLocaleString("en-PH")}?! Lilipad ka ba o bibili ng pakpak?`,
    `₱${amountPhp.toLocaleString("en-PH")} — sure ka ba, o impulse shopping yan?`,
  ];
  const idx = stableHash(`spicy:${amountPhp}:${salt}`) % lines.length;
  return lines[idx]!;
}
