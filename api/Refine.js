import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const body =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};

    const text = (body.text || "").trim();
    const mode = body.mode || "general";

    if (!text) {
      return res.status(400).json({ error: "Missing text." });
    }

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: `
You are CoThink, a prompt-refinement helper.

Your job:
- Improve the user's rough input into a clear AI-ready prompt.
- Preserve the user's intent.
- Do not answer the prompt.
- Do not add fake facts.
- Keep it concise, practical, and easy to copy.
- If the input is vague, make the prompt ask for clarification.
- Format with clean spacing, not one ugly wall of text.

Mode: ${mode}

User input:
${text}

Return only the improved prompt.
`
    });

    return res.status(200).json({
      refined: response.output_text
    });
  } catch (error) {
    console.error("OpenAI error:", error);
    return res.status(500).json({
      error: "Failed to refine input."
    });
  }
}
