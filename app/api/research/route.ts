import { NextRequest, NextResponse } from "next/server";
import FirecrawlApp from "@mendable/firecrawl-js";
import { generateText, Output } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import dotenv from "dotenv";
dotenv.config();

const firecrawl = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    // 1. Research Phase: Scrape the site for mission and stack
    const scrapeResult = await firecrawl.scrapeUrl(url, {
      formats: ["markdown"],
    });
    const domain = new URL(url).hostname.replace("www.", "");

    // 2. Lead Discovery Phase: Extract context and identify ideal POC roles
    const { output: intel } = await generateText({
      model: openai("gpt-4o-mini"),
      output: Output.object({
        schema: z.object({
          companyName: z.string(),
          mission: z.string(),
          techStack: z.array(z.string()),
          targetRole: z
            .string()
            .describe(
              "The most relevant job title to contact (e.g., CTO, Head of Engineering)"
            ),
        }),
      }),
      prompt: `Analyze this site and tell me who a CS student should email for an internship: \n\n${scrapeResult}`,
    });

    // 3. Email Finding Phase (Using Hunter.io API as an example)
    const hunterRes = await fetch(
      `https://api.hunter.io/v2/domain-search?domain=${domain}&api_key=${process.env.HUNTER_API_KEY}`
    );
    const hunterData = await hunterRes.json();

    console.log(hunterData);

    // Filter Hunter results for the targetRole identified by AI
    const poc =
      hunterData.data.emails.find((e: any) =>
        e.position?.toLowerCase().includes(intel.targetRole.toLowerCase())
      ) || hunterData.data.emails[0]; // Fallback to first available email

    return NextResponse.json({
      ...intel,
      contact: {
        name: `${poc?.first_name || "Hiring Manager"} ${poc?.last_name || ""}`,
        email: poc?.value || "Not found",
        position: poc?.position || intel.targetRole,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
