import fs from "fs";
import path from "path";
import readline from "readline";
import Anthropic from "@anthropic-ai/sdk";
import { ANTHROPIC_API_KEY } from "./config";
import { ARCHITECT_PATHS } from "./path";
import { gitDiff } from "./tools/gitDiff";
import { gitStatus } from "./tools/gitStatus";
import { searchRepository } from "./tools/searchRepository";

const anthropic = new Anthropic({
  apiKey: ANTHROPIC_API_KEY,
});

const PROJECT_SUMMARY_PATH = ARCHITECT_PATHS.state.projectSummary;

const LATEST_RESPONSE_PATH = ARCHITECT_PATHS.state.latestResponse;

const HEARTBEAT_INTERVAL = 4.5 * 60 * 1000;

const tools: Anthropic.Messages.Tool[] = [
  {
    name: "search_repository",
    description:
      "Search the current target repository for an exact text query and return matching file paths, line ranges, and content.",
    input_schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The exact text to search for in repository files.",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "git_status",
    description:
      "Get the current Git status of the target repository. This is read-only current workspace evidence.",
    input_schema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "git_diff",
    description:
      "Get the current unstaged working-tree diff of the target repository. This is read-only current workspace evidence.",
    input_schema: {
      type: "object",
      properties: {},
    },
  },
];

async function requestChatResponse(
  system: Anthropic.Messages.MessageCreateParams["system"],
  prompt: string,
): Promise<Anthropic.Messages.Message> {
  const messages: Anthropic.Messages.MessageParam[] = [
    {
      role: "user",
      content: prompt,
    },
  ];

  while (true) {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4000,
      system,
      tools,
      messages,
    });

    if (response.stop_reason !== "tool_use") {
      return response;
    }

    messages.push({ role: "assistant", content: response.content });

    const toolResults: Anthropic.Messages.ToolResultBlockParam[] = [];

    for (const block of response.content) {
      if (block.type !== "tool_use") continue;

      if (block.name !== "search_repository") {
        if (block.name === "git_status") {
          toolResults.push({
            type: "tool_result",
            tool_use_id: block.id,
            content: JSON.stringify(gitStatus()),
          });
          continue;
        }

        if (block.name === "git_diff") {
          toolResults.push({
            type: "tool_result",
            tool_use_id: block.id,
            content: JSON.stringify(gitDiff()),
          });
          continue;
        }

        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          is_error: true,
          content: `Unknown tool: ${block.name}`,
        });
        continue;
      }

      const input = block.input as { query?: unknown };

      if (typeof input.query !== "string") {
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          is_error: true,
          content: "search_repository requires a string query.",
        });
        continue;
      }

      toolResults.push({
        type: "tool_result",
        tool_use_id: block.id,
        content: JSON.stringify(searchRepository(input.query)),
      });
    }

    messages.push({ role: "user", content: toolResults });
  }
}

export async function runChat() {
  const summaryPath = PROJECT_SUMMARY_PATH;
  const responsePath = LATEST_RESPONSE_PATH;

  if (!fs.existsSync(summaryPath)) {
    console.error("❌ Context missing. Run 'architect context' first.");
    return;
  }

  const projectSummary = fs.readFileSync(summaryPath, "utf8");

  const cachedSystem = [
    {
      type: "text" as const,
      text: projectSummary,
      cache_control: {
        type: "ephemeral" as const,
      },
    },
  ];

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  let heartbeatTimer: NodeJS.Timeout | undefined;
  let active = true;

  const resetHeartbeat = () => {
    if (!active) return;

    if (heartbeatTimer) {
      clearTimeout(heartbeatTimer);
    }

    heartbeatTimer = setTimeout(async () => {
      if (!active) return;

      try {
        await anthropic.messages.create({
          model: "claude-sonnet-4-6",
          max_tokens: 1,
          system: cachedSystem,
          messages: [
            {
              role: "user",
              content: "ping",
            },
          ],
        });

        if (active) {
          console.log("\n💓 Heartbeat · Cache window refreshed");
        }
      } catch {
        if (active) {
          console.log("\n⚠️ Heartbeat failed · Cache may need to be rebuilt");
        }
      }

      if (active) {
        resetHeartbeat();
      }
    }, HEARTBEAT_INTERVAL);
  };

  console.log("🤖 ARCHITECT CONSOLE ACTIVE");
  console.log("💾 Prompt caching enabled");
  console.log("💓 Cache keep-alive enabled · 4.5m");
  console.log("💡 Type 'exit' to close Architect.");

  resetHeartbeat();

  const ask = () => {
    rl.question("\n👤 You: ", async (input) => {
      const prompt = input.trim();

      if (prompt.toLowerCase() === "exit") {
        active = false;

        if (heartbeatTimer) {
          clearTimeout(heartbeatTimer);
        }

        rl.close();
        return;
      }

      if (!prompt) {
        ask();
        return;
      }

      try {
        const response = await requestChatResponse(cachedSystem, prompt);

        const textBlock = response.content.find(
          (block): block is Anthropic.Messages.TextBlock =>
            block.type === "text",
        );

        if (!textBlock || textBlock.type !== "text") {
          throw new Error("Chat model returned no text response.");
        }

        fs.writeFileSync(responsePath, textBlock.text);

        const uncachedInput = response.usage.input_tokens ?? 0;
        const cacheCreated = response.usage.cache_creation_input_tokens ?? 0;
        const cacheRead = response.usage.cache_read_input_tokens ?? 0;

        const totalInput = uncachedInput + cacheCreated + cacheRead;

        if (cacheRead > 0) {
          const cacheHitRate =
            totalInput > 0
              ? ((cacheRead / totalInput) * 100).toFixed(1)
              : "0.0";

          console.log("\n💎 PROMPT CACHE HIT");
          console.log(`💾 Cache read: ${cacheRead.toLocaleString()} tokens`);
          console.log(`📊 Cache hit rate: ${cacheHitRate}%`);
        } else if (cacheCreated > 0) {
          console.log("\n🆕 PROMPT CACHE CREATED");
          console.log(
            `💾 Cache written: ${cacheCreated.toLocaleString()} tokens`,
          );
        } else {
          console.log("\n⚪ PROMPT CACHE NOT USED");
        }

        console.log(
          `📥 Uncached input: ${uncachedInput.toLocaleString()} tokens`,
        );

        console.log(
          `📤 Output: ${response.usage.output_tokens.toLocaleString()} tokens`,
        );

        console.log("\n🤖 Architect:");
        console.log(textBlock.text);

        console.log(
          `\n🏛️ Response compiled to: ${path.basename(responsePath)}`,
        );
      } catch (error: any) {
        console.error(`\n❌ Chat Error: ${error.message}`);
      }

      // Keep the heartbeat aligned with the most recent user activity.
      if (active) {
        resetHeartbeat();
      }

      ask();
    });
  };

  ask();
}
