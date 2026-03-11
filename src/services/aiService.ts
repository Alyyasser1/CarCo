const API_URL = "https://openrouter.ai/api/v1/chat/completions";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CarRecommendation {
  name: string;
  priceRange: string;
  engineSpecs: string;
  pros: string[];
  cons: string[];
  whyItMatches: string;
}

export interface RecommendationResult {
  cars: CarRecommendation[];
}

export interface DiagnosisCause {
  cause: string;
  severity: "low" | "medium" | "high";
  estimatedRepairCost: string;
  fixSteps: string[];
  visitMechanic: boolean;
}

export interface DiagnosisResult {
  causes: DiagnosisCause[];
}

// ─── Input Types ──────────────────────────────────────────────────────────────

export interface RecommendationInput {
  brands: string[];
  category: string;
  yearFrom?: string;
  yearTo?: string;
  requirements?: string;
}

export interface DiagnosisInput {
  brand: string;
  year?: string;
  problem: string;
}

// ─── Shared API caller ────────────────────────────────────────────────────────

async function callAI(prompt: string): Promise<string> {
  console.log(
    "API KEY:",
    import.meta.env.VITE_OPENROUTER_API_KEY ? "loaded ✓" : "MISSING ✗",
  );

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
      "HTTP-Referer": "http://localhost:5173",
      "X-Title": "My App",
    },
    body: JSON.stringify({
      model: "anthropic/claude-sonnet-4.6",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 800,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json();
    console.error("OpenRouter API error:", errorBody);
    if (response.status === 429) {
      throw new Error(
        "Rate limit reached. Please wait a moment and try again.",
      );
    }
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

// ─── Recommendation Service ───────────────────────────────────────────────────

export async function getCarRecommendations(
  input: RecommendationInput,
): Promise<RecommendationResult> {
  const yearRange =
    input.yearFrom && input.yearTo
      ? `between ${input.yearFrom} and ${input.yearTo}`
      : input.yearFrom
        ? `from ${input.yearFrom} onwards`
        : input.yearTo
          ? `up to ${input.yearTo}`
          : "any year";

  const prompt = `You are a car recommendation expert. The user wants a car with these preferences and if the user add price limits stick to it in the market of Egypt:
- Preferred brands: ${input.brands.join(", ")}
- Category: ${input.category}
- Model year: ${yearRange}
- Additional requirements: ${input.requirements || "None"}

Return ONLY a valid JSON object with no markdown, no backticks, no explanation. Use this exact structure:
{
  "cars": [
    {
      "name": "full car name and model", get the car names in the market of egypt
      "priceRange": "e.g. $25,000 – $30,000",
      "engineSpecs": "e.g. 2.0L 4-cylinder, 180hp",
      "pros": ["pro 1", "pro 2", "pro 3"],
      "cons": ["con 1", "con 2"],
      "whyItMatches": "one sentence explaining why this fits the user"
    }
  ]
}

Return 2 to 3 cars. Return ONLY the JSON, nothing else.`;

  const raw = await callAI(prompt);

  try {
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed: RecommendationResult = JSON.parse(cleaned);
    return parsed;
  } catch {
    throw new Error("Failed to parse recommendation response.");
  }
}

// ─── Diagnosis Service ────────────────────────────────────────────────────────

export async function getCarDiagnosis(
  input: DiagnosisInput,
): Promise<DiagnosisResult> {
  const prompt = `You are an expert car mechanic and diagnostician. The user has this car issue:
- Car brand: ${input.brand}
- Model year: ${input.year || "Not specified"}
- Problem: ${input.problem}

Return ONLY a valid JSON object with no markdown, no backticks, no explanation. Use this exact structure:
{
  "causes": [
    {
      "cause": "name of the cause",
      "severity": "low" | "medium" | "high",
      "estimatedRepairCost": "e.g. $100 – $300", display the price in EGP and estimate it due to the prices in the car market of egypt
      "fixSteps": ["step 1", "step 2", "step 3"],
      "visitMechanic": true or false
    }
  ]
}

Return 2 to 3 most likely causes. Return ONLY the JSON, nothing else.`;

  const raw = await callAI(prompt);

  try {
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed: DiagnosisResult = JSON.parse(cleaned);
    return parsed;
  } catch {
    throw new Error("Failed to parse diagnosis response.");
  }
}
