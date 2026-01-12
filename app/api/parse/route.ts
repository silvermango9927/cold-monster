import { NextRequest, NextResponse } from "next/server";
import PDFParser from "pdf-parse-new";
import { generateText, Output } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await (file as File).arrayBuffer());

    const pdfData = await PDFParser(buffer);
    const rawText = pdfData.text;

    const prompt = `Extract the following fields from the resume text.
Return an object with: name, email, skills (array of strings), experience_score (1-10), and summary (2 sentences).

Resume text:\n\n${rawText?.slice(0, 15000) ?? ""}`;

    const { output } = await generateText({
      model: openai("gpt-4o-mini"),
      output: Output.object({
        schema: z.object({
          name: z.string(),
          email: z.string().email().optional(),
          skills: z.array(z.string()).default([]),
          experience_score: z
            .number()
            .min(1)
            .max(10)
            .describe("1-10 rating of candidate experience"),
          summary: z.string().describe("A 2-sentence professional bio"),
        }),
      }),
      prompt,
    });

    return NextResponse.json({ data: output }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
