import fs from "fs";
import path from "path";
import readline from "readline";
import Anthropic from "@anthropic-ai/sdk";
import { ANTHROPIC_API_KEY } from "./config";

const anthropic = new Anthropic({
  apiKey: ANTHROPIC_API_KEY,
});

const HEARTBEAT_INTERVAL = 4.5 * 60 * 1000;

export async function runChat() {
  const projectRoot = process.cwd();

  const summaryPath = path.join(projectRoot, "project-summary.md");
  const responsePath = path.join(projectRoot, "LATEST_RESPONSE.md");

  if (!fs.existsSync(summaryPath)) {
    console.error("❌ Context missing. Run 'architect crawl' first.");
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
        const response = await anthropic.messages.create({
          model: "claude-sonnet-4-6",
          max_tokens: 4000,
          system: cachedSystem,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        });

        const textBlock = response.content.find(
          (block) => block.type === "text",
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
