import { generateText, Output } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { getPrompt } from "@/lib/prompts";

export async function POST(req: Request) {
  console.log("[Generate] Starting email generation...");

  try {
    const body = await req.json();
    const { resumeData, targetIntel, pocName, tone, targetRole } = body;

    console.log("[Generate] Received request:", {
      hasResumeData: !!resumeData,
      hasTargetIntel: !!targetIntel,
      pocName,
      tone,
      targetRole,
    });

    if (!resumeData || !targetIntel) {
      console.log("[Generate] Missing required data");
      return Response.json(
        { error: "Missing resumeData or targetIntel" },
        { status: 400 },
      );
    }

    console.log("[Generate] Calling OpenAI...");
    const systemPrompt = getPrompt("EMAIL_SYSTEM");
    const userPrompt = getPrompt("EMAIL_USER");
    console.log("[Generate] Using system prompt:", systemPrompt.substring(0, 100) + "...");
    console.log("[Generate] Using user prompt:", userPrompt.substring(0, 100) + "...");

    const { output } = await generateText({
      model: openai("gpt-4o"),
      output: Output.object({
        schema: z.object({
          subject: z.string(),
          body: z.string(),
        }),
      }),
      system: systemPrompt,
      prompt: `${userPrompt}

---

CANDIDATE INFORMATION:
${JSON.stringify(resumeData, null, 2)}

STARTUP/COMPANY INTEL:
${JSON.stringify(targetIntel, null, 2)}

TARGET ROLE: ${targetRole || "Software Engineer"}
RECIPIENT NAME: ${pocName}
TONE: ${tone || "casual"}

IMPORTANT: The email body MUST be between 150-200 words. Do not write less than 150 words.
    `,
    });

    console.log("[Generate] OpenAI response:", output);

    if (!output || !output.subject || !output.body) {
      console.log("[Generate] Invalid output from OpenAI:", output);
      return Response.json(
        { error: "Failed to generate email - invalid response from AI" },
        { status: 500 },
      );
    }

    console.log("[Generate] Success! Subject:", output.subject);
    return Response.json(output);
  } catch (error) {
    console.error("[Generate] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
