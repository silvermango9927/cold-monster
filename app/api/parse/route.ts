import { NextRequest, NextResponse } from "next/server";
import PDFParser from "pdf-parse-new";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/service";
import { prompts } from "@/lib/prompts";
import dotenv from "dotenv";
dotenv.config();

const ResumeSchema = z.object({
  name: z.string().describe("Full name of the candidate"),
  email: z
    .string()
    .nullable()
    .describe("Email address if present, or null if not found"),
  skills: z.array(z.string()).describe("List of skills/technologies mentioned"),
  key_experiences: z
    .string()
    .describe("Summary of key professional experiences"),
  experience_score: z
    .number()
    .min(1)
    .max(10)
    .describe("1-10 rating of candidate experience"),
  summary: z.string().describe("A 2-sentence professional bio"),
});

function safeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "_");
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY" },
        { status: 500 }
      );
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: "Missing SUPABASE_SERVICE_ROLE_KEY" },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");
    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await (file as File).arrayBuffer());

    // 1) Parse PDF to extract text
    const pdfData = await PDFParser(buffer);
    const rawText = pdfData.text ?? "";

    if (!rawText.trim()) {
      return NextResponse.json(
        { error: "Could not extract text from PDF" },
        { status: 400 }
      );
    }

    // 2) LLM structured extraction using generateObject (recommended for structured output)
    const { object: parsedResume } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: ResumeSchema,
      prompt: `${prompts.RESUME_PARSE}

Resume text:
${rawText.slice(0, 15000)}`,
    });

    console.log("[/api/parse] Parsed resume:", parsedResume);
    // 3) Store parsed JSON in Supabase Storage bucket
    const supabase = createServiceClient();
    const fileName = (file as File).name;
    const storagePath = `parsed/${Date.now()}_${safeFilename(fileName)}.json`;

    const { error: storageError } = await supabase.storage
      .from("resumes")
      .upload(storagePath, JSON.stringify(parsedResume, null, 2), {
        contentType: "application/json",
        upsert: true,
      });

    if (storageError) {
      return NextResponse.json(
        { error: "Storage upload failed", details: storageError.message },
        { status: 500 }
      );
    }

    // 4) Also persist in DB table for querying
    // const { error: dbError } = await supabase.from("resumes").insert({
    //   file_name: fileName,
    //   storage_path: storagePath,
    //   parsed_json: parsedResume,
    //   raw_text: rawText,
    // });

    // if (dbError) {
    //   return NextResponse.json(
    //     { error: "DB insert failed", details: dbError.message },
    //     { status: 500 }
    //   );
    // }

    const { error: dbError } = await supabase.from("resumes").insert({
      file_name: fileName,
      parsed_json: parsedResume,
      raw_text: rawText,
    });

    if (dbError) {
      console.error("[/api/parse] DB insert error:", dbError);
      // Not failing the request since storage succeeded.
    }

    return NextResponse.json(
      { data: parsedResume, storagePath },
      { status: 200 }
    );
  } catch (error) {
    console.error("[/api/parse] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
