import Anthropic from "@anthropic-ai/sdk";
import type { CrawledFile } from "./crawl";
import { ANTHROPIC_API_KEY } from "./config";

const anthropic = new Anthropic({
  apiKey: ANTHROPIC_API_KEY,
});

export async function compressProject(files: CrawledFile[]): Promise<string> {
  const corpus = files
    .map((file) => `FILE: ${file.path}\n\n${file.content}`)
    .join("\n\n");

  console.log(`🧠 Compression input: ${corpus.length} characters`);
  console.log(
    `🧮 Compression input: ${Math.ceil(corpus.length / 4)} estimated tokens`,
  );

  const response = await anthropic.messages.create({
    // We'll make model selection configurable shortly.
    model: "claude-haiku-4-5",
    max_tokens: 4000,

    system: `
You are Architect's semantic compression engine.

Your task is to analyze the supplied repository evidence and produce
a concise architectural representation of the project.

Explain the architecture of this project.

Preserve important:
- project purpose
- architectural layers
- major components
- relationships between components
- runtime boundaries
- contracts and interfaces
- important dependencies
- data flow
- external systems
- significant architectural decisions

Do not reproduce source code.
Do not summarize every file individually.
Do not invent architecture that is not supported by the supplied evidence.

Prefer relationships and architectural meaning over implementation detail.
    `.trim(),

    messages: [
      {
        role: "user",
        content: corpus,
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");

  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Compression model returned no text summary.");
  }

  return textBlock.text;
}
