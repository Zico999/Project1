// api/summarise.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const apiKey = process.env.apikey;
  if (!apiKey) {
    return res.status(500).json({ error: "Server API key not set" });
  }

  const { text, length, style, focus } = req.body;
  if (!text) return res.status(400).json({ error: "No text provided" });

  try {
    const lengthMap = {
      short: "in 1–2 sentences",
      medium: "in one concise paragraph",
      long: "in a detailed multi-paragraph summary",
    };

    const styleMap = {
      concise: "Write in a concise, direct style.",
      bullet: "Format the summary as clear bullet points.",
      formal: "Write in a formal, professional tone.",
      simple: "Write in very simple language, as if explaining to a 10-year-old (ELI5 style).",
    };

    const prompt = `You are an expert document summariser. Summarise the following document ${lengthMap[length]}, focusing on ${focus}. ${styleMap[style]} Do not add any preamble — just provide the summary directly.\n\nDocument:\n"""\n${text}\n"""`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();
    if (!data.content || !data.content[0]?.text) {
      return res.status(500).json({ error: "No summary returned from Claude" });
    }

    res.status(200).json({ summary: data.content[0].text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}