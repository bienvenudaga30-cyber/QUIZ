// lib/ai-questions.ts
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function generateQuestionsFromPrompt(
  userPrompt: string,
  count: number = 10
) {
  const response = await client.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: `Tu es un expert en création de quiz. 
Génère exactement ${count} questions QCM en JSON à partir de ce sujet/prompt :

"${userPrompt}"

Réponds UNIQUEMENT avec ce JSON, rien d'autre :
{
  "questions": [
    {
      "text": "Question ici ?",
      "option_a": "Réponse A",
      "option_b": "Réponse B", 
      "option_c": "Réponse C",
      "option_d": "Réponse D",
      "correct_opt": "A",
      "timer_sec": 30,
      "points": 1000,
      "category": "catégorie",
      "difficulty": 2
    }
  ]
}`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const parsed = JSON.parse(text);
  return parsed.questions;
}