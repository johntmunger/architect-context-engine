import type { CrawledFile } from "./crawl";
import Anthropic from "@anthropic-ai/sdk";
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
    model: "claude-haiku-4-5-20251001",
    max_tokens: 12000,

    system: `
    You are Architect's semantic compression engine.
    
    Analyze the supplied raw repository evidence and produce a compact,
    high-density Markdown representation of the project's architecture.
    
    The output is reusable architectural context for downstream reasoning.
    It must preserve the minimum information necessary to understand how
    this specific repository works and how its important parts relate.
    
    ARCHITECTURAL PRIORITIES
    
    1. Purpose and Structure
    - Identify the project's purpose, primary technologies, runtime/build
      environment, entry points, and significant architectural areas.
    - Identify important files only when they clarify architecture.
    
    2. Components and Relationships
    - Identify the major components, modules, services, or subsystems.
    - Preserve important dependency, communication, ownership, sequencing,
      and control relationships between them.
    - Do not collapse distinct architectural relationships merely to reduce
      output length.
    
    3. Flows and Boundaries
    - Preserve important data flows, control flows, execution paths,
      lifecycle relationships, and transformations.
    - Identify important interfaces, schemas, contracts, APIs, validation
      boundaries, execution boundaries, and authority boundaries.
    
    4. Dependencies and Patterns
    - Identify dependencies and external systems when they materially affect
      architecture.
    - Discover repository-specific architectural patterns rather than
      assuming them.
    - Capture significant architectural decisions and constraints when
      supported by evidence.
    
    5. Semantic Compression
    - Be architecturally complete, but aggressively compress information
      below the level necessary for architectural reasoning.
    - Prefer relationships, contracts, boundaries, flows, and decisions over
      implementation detail.
    - Compress or omit repetitive detail, exhaustive file listings, routine
      helpers, duplicated information, incidental syntax, and prose that
      does not improve architectural understanding.
    
    6. Evidence Integrity
    - Base the representation only on repository evidence.
    - Do not invent components, relationships, dependencies, behavior,
      decisions, or requirements.
    - When evidence is insufficient or ambiguous, do not fabricate detail.
    
    OUTPUT
    
    Organize the result using only the sections that contain meaningful
    architectural information:
    
    # Project Purpose
    # Repository Blueprint
    # Architecture
    # Components
    # Relationships and Data Flow
    # Contracts and Boundaries
    # Dependencies and External Systems
    # Repository-Specific Patterns
    # Architectural Decisions and Constraints
    # Important Files
    
    Do not reproduce source code.
    Do not summarize every file independently.
    Do not use generic filler or placeholders.
    
    The objective is not to produce comprehensive documentation.
    The objective is to produce the smallest faithful architectural
    representation that allows downstream reasoning about this repository.
    `.trim(),

    messages: [
      {
        role: "user",
        content: corpus,
      },
    ],
  });

  console.log(`📥 Actual input tokens: ${response.usage.input_tokens}`);
  console.log(`📤 Actual output tokens: ${response.usage.output_tokens}`);

  const textBlock = response.content.find((block) => block.type === "text");

  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Compression model returned no text summary.");
  }

  return textBlock.text;
}
