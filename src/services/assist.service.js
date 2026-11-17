import { PRODUCT_CATEGORIES } from "@/lib/constants.js";
import { callOpenRouter } from "@/lib/openrouter.js";

const DESCRIBE_SYSTEM =
  "You write short, honest marketplace descriptions for second-hand campus items. " +
  "Given the item details, output 2-3 short sentences (max 350 characters). " +
  "Do not invent specs — only restate what is given. No hype, no markdown, no greetings. " +
  "Plain, friendly student tone.";

const CLASSIFY_SYSTEM =
  "Classify a second-hand campus item into EXACTLY ONE of these categories: " +
  "Books, Electronics, Furniture, Stationery, Other. " +
  "Reply with ONLY the category name — no punctuation, no explanation.";

function listingHint({ name, category, condition, listingType, price }) {
  const pricePart =
    listingType === "Free" ? "Given away free." : `Price: INR ${Number(price ?? 0)}.`;

  return [
    `Item: ${name}`,
    category ? `Category: ${category}` : null,
    condition ? `Condition: ${condition}` : null,
    `Listing type: ${listingType ?? "For Sale"}`,
    pricePart,
  ]
    .filter(Boolean)
    .join("\n");
}

function normalizeSuggestion(text) {
  const firstLine = String(text).split(/\r?\n/)[0].trim();
  const cleaned = firstLine.replace(/["'.:]+$/g, "").trim();
  const match = PRODUCT_CATEGORIES.find(
    (category) => category.toLowerCase() === cleaned.toLowerCase()
  );
  return match ? { category: match, fallback: false } : { category: "Other", fallback: true };
}

/** Generates a short honest description from the item details. */
export async function describeListing(input = {}) {
  const text = await callOpenRouter(
    [
      { role: "system", content: DESCRIBE_SYSTEM },
      { role: "user", content: listingHint(input) },
    ],
    { maxTokens: 400, temperature: 0.3 }
  );

  // Strip common wrappers models add despite the instruction.
  const cleaned = text
    .replace(/^(here is a|here's a)?\s*(suggested)?\s*description[:\s-]*/i, "")
    .trim();

  return cleaned.slice(0, 600);
}

/** Classifies the item into one of the five campus categories. */
export async function suggestCategory({ name, description } = {}) {
  const text = await callOpenRouter(
    [
      { role: "system", content: CLASSIFY_SYSTEM },
      {
        role: "user",
        content: [
          `Item: ${name}`,
          description ? `Description: ${description}` : null,
        ]
          .filter(Boolean)
          .join("\n"),
      },
    ],
    { maxTokens: 300, temperature: 0 }
  );

  return normalizeSuggestion(text);
}

const assistService = { describeListing, suggestCategory };

export default assistService;
