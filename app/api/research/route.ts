import { NextRequest, NextResponse } from "next/server";
import FirecrawlApp from "@mendable/firecrawl-js";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { prompts } from "@/lib/prompts";
import dotenv from "dotenv";
dotenv.config();

const firecrawl = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });

const ResearchSchema = z.object({
  companyName: z.string(),
  mission: z.string(),
  recentProjects: z.array(z.string()),
  idealCandidateTraits: z.array(z.string()),
  techStack: z.array(z.string()),
  targetRole: z
    .string()
    .describe("Best role to contact for an internship outreach"),
  keyPeople: z
    .array(
      z.object({
        firstName: z.string(),
        lastName: z.string(),
        role: z.string().nullable(),
      })
    )
    .describe(
      "Names of founders, executives, or team leads mentioned on the site"
    ),
});

// Type for Hunter.io email response
interface HunterEmail {
  value: string;
  type?: string;
  position?: string;
  first_name?: string;
  last_name?: string;
  verification?: {
    status?: string;
  };
}

type Contact = {
  name: string;
  email: string;
  position: string;
  verified: boolean;
};

const ROLE_PRIORITY = [
  "founder",
  "co-founder",
  "ceo",
  "cto",
  "chief technology officer",
  "head of engineering",
  "vp engineering",
  "vp of engineering",
  "director of engineering",
  "engineering manager",
  "lead engineer",
  "tech lead",
  "software engineering manager",
  "product lead",
];

function scoreEmail(email: HunterEmail, targetRole: string) {
  const value = (email.value || "").toLowerCase();
  if (!value) return -Infinity;

  const position = (email.position || "").toLowerCase();
  let score = 1; // base score for any valid email

  // Boost for matching target role
  if (position && position.includes(targetRole.toLowerCase())) score += 8;

  // Boost for leadership roles
  ROLE_PRIORITY.forEach((role, idx) => {
    if (position.includes(role)) {
      score += 6 + (ROLE_PRIORITY.length - idx) * 0.1;
    }
  });

  // Prefer personal and verified emails
  if (email.type === "personal") score += 3;
  if (
    email.verification?.status === "valid" ||
    email.verification?.status === "verified"
  )
    score += 2;

  // Slight penalty for generic emails but don't exclude them
  const genericPatterns = [
    /^info@/i,
    /^support@/i,
    /^help@/i,
    /^hello@/i,
    /^contact@/i,
    /^sales@/i,
  ];
  if (genericPatterns.some((re) => re.test(value))) score -= 5;

  return score;
}

function domainKey(hostname: string) {
  const parts = hostname.split(".");
  if (parts.length >= 2) return parts[parts.length - 2];
  return hostname;
}

async function verifyEmail(
  email: string,
  apiKey: string
): Promise<{ valid: boolean; status: string; score: number }> {
  try {
    const url = `https://api.hunter.io/v2/email-verifier?email=${encodeURIComponent(
      email
    )}&api_key=${apiKey}`;
    console.log("[Hunter Email Verifier] Verifying:", email);
    const res = await fetch(url);
    const data = await res.json();
    console.log(
      "[Hunter Email Verifier] Response:",
      JSON.stringify(data?.data, null, 2)
    );

    const status = data?.data?.status || "unknown";
    const score = data?.data?.score ?? 0;
    // Consider valid if status is "valid" or score >= 50
    const valid = status === "valid" || score >= 50;

    return { valid, status, score };
  } catch (e) {
    console.log("[Hunter Email Verifier] Error:", e);
    return { valid: false, status: "error", score: 0 };
  }
}

async function hunterEmailFinder(
  domain: string,
  firstName: string,
  lastName: string,
  apiKey: string
): Promise<{ email: string; score: number } | null> {
  try {
    const url = `https://api.hunter.io/v2/email-finder?domain=${encodeURIComponent(
      domain
    )}&first_name=${encodeURIComponent(
      firstName
    )}&last_name=${encodeURIComponent(lastName)}&api_key=${apiKey}`;
    console.log(
      "[Hunter Email Finder] Trying:",
      firstName,
      lastName,
      "@",
      domain
    );
    const res = await fetch(url);
    const data = await res.json();
    console.log(
      "[Hunter Email Finder] Response:",
      JSON.stringify(data, null, 2)
    );
    if (data?.data?.email) {
      return { email: data.data.email, score: data.data.score ?? 0 };
    }
  } catch (e) {
    console.log("[Hunter Email Finder] Error:", e);
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    console.log("[Research] Starting research for URL:", url);

    if (!url) {
      return NextResponse.json({ error: "Missing URL" }, { status: 400 });
    }
    if (!process.env.FIRECRAWL_API_KEY) {
      return NextResponse.json(
        { error: "Missing FIRECRAWL_API_KEY" },
        { status: 500 }
      );
    }

    const domain = new URL(url).hostname.replace("www.", "");
    const companyKey = domainKey(domain);
    console.log("[Research] Domain:", domain, "| Company Key:", companyKey);

    // 1) Scrape the main site into markdown
    console.log("[Research] Step 1: Scraping main site...");
    const scrapeResult = await firecrawl.scrapeUrl(url, {
      formats: ["markdown"],
    });
    console.log("[Research] Main site scrape success:", scrapeResult?.success);

    // Best-effort: also try common careers/jobs/about/team paths
    const careerMarkdown: string[] = [];
    const altPaths = ["/careers", "/jobs", "/about", "/team", "/about-us"];
    for (const path of altPaths) {
      try {
        const altUrl = new URL(path, url).toString();
        const alt = await firecrawl.scrapeUrl(altUrl, {
          formats: ["markdown"],
        });
        if (alt?.success && alt.markdown) {
          console.log("[Research] Scraped alt path:", path);
          careerMarkdown.push(alt.markdown);
        }
      } catch {
        // ignore
      }
    }

    if (!scrapeResult?.success || !scrapeResult.markdown) {
      console.log("[Research] Main site scrape failed");
      return NextResponse.json(
        { error: "Failed to scrape target website" },
        { status: 502 }
      );
    }

    // 2) Ask LLM to extract structured intel from the scraped markdown
    console.log("[Research] Step 2: Extracting intel via LLM...");
    const combinedMarkdown = [scrapeResult.markdown, ...careerMarkdown]
      .join("\n\n")
      .slice(0, 20000);

    const { object: intel } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: ResearchSchema,
      prompt: `${prompts.RESEARCH_EXTRACT}

Scraped markdown:
${combinedMarkdown}`,
    });

    console.log(
      "[Research] LLM extracted intel:",
      JSON.stringify(intel, null, 2)
    );

    // 3) Try Hunter.io Domain Search first
    let contact: Contact | null = null;

    if (process.env.HUNTER_API_KEY) {
      console.log("[Research] Step 3: Trying Hunter.io Domain Search...");
      try {
        const hunterUrl = `https://api.hunter.io/v2/domain-search?domain=${domain}&api_key=${process.env.HUNTER_API_KEY}`;
        console.log(
          "[Hunter Domain Search] URL:",
          hunterUrl.replace(process.env.HUNTER_API_KEY!, "***")
        );
        const hunterRes = await fetch(hunterUrl);
        const hunterData = await hunterRes.json();
        console.log("[Hunter Domain Search] Status:", hunterRes.status);
        console.log(
          "[Hunter Domain Search] Response meta:",
          JSON.stringify(hunterData?.meta, null, 2)
        );
        console.log(
          "[Hunter Domain Search] Email count:",
          hunterData?.data?.emails?.length ?? 0
        );

        const emails: HunterEmail[] = hunterData?.data?.emails ?? [];

        if (emails.length > 0) {
          console.log(
            "[Hunter Domain Search] Scoring",
            emails.length,
            "emails..."
          );
          const ranked = emails
            .map((email) => ({
              email,
              score: scoreEmail(email, intel.targetRole),
            }))
            .sort((a, b) => b.score - a.score);

          console.log("[Hunter Domain Search] Top 3 ranked emails:");
          ranked.slice(0, 3).forEach((r, i) => {
            console.log(
              `  ${i + 1}. ${r.email.value} (${
                r.email.position || "no position"
              }) - score: ${r.score}`
            );
          });

          // Try to verify the top ranked emails until we find a valid one
          for (const { email: best } of ranked.slice(0, 5)) {
            if (best && best.value) {
              const verification = await verifyEmail(
                best.value,
                process.env.HUNTER_API_KEY!
              );
              console.log(
                "[Hunter Domain Search] Email verification for",
                best.value,
                ":",
                verification.status,
                "score:",
                verification.score
              );

              contact = {
                name:
                  `${best.first_name || ""} ${best.last_name || ""}`.trim() ||
                  "Contact",
                email: best.value,
                position: best.position || intel.targetRole,
                verified: verification.valid,
              };

              // If verified, use this email; otherwise continue to try next
              if (verification.valid) {
                console.log(
                  "[Hunter Domain Search] Found verified email:",
                  JSON.stringify(contact, null, 2)
                );
                break;
              } else {
                console.log(
                  "[Hunter Domain Search] Email not verified, trying next..."
                );
              }
            }
          }

          if (contact) {
            console.log(
              "[Hunter Domain Search] Selected contact:",
              JSON.stringify(contact, null, 2)
            );
          }
        } else {
          console.log("[Hunter Domain Search] No emails found for domain");
        }
      } catch (e) {
        console.log("[Hunter Domain Search] Error:", e);
      }

      // 4) If no contact from domain search, try Email Finder with extracted names
      if (!contact && intel.keyPeople && intel.keyPeople.length > 0) {
        console.log(
          "[Research] Step 4: Trying Hunter.io Email Finder with",
          intel.keyPeople.length,
          "key people..."
        );
        for (const person of intel.keyPeople.slice(0, 3)) {
          if (person.firstName && person.lastName) {
            const found = await hunterEmailFinder(
              domain,
              person.firstName,
              person.lastName,
              process.env.HUNTER_API_KEY!
            );
            if (found && found.email) {
              // Verify the found email
              const verification = await verifyEmail(
                found.email,
                process.env.HUNTER_API_KEY!
              );
              console.log(
                "[Hunter Email Finder] Email verification for",
                found.email,
                ":",
                verification.status,
                "score:",
                verification.score
              );

              contact = {
                name: `${person.firstName} ${person.lastName}`,
                email: found.email,
                position: person.role || intel.targetRole,
                verified: verification.valid,
              };
              console.log(
                "[Hunter Email Finder] Found email:",
                JSON.stringify(contact, null, 2)
              );

              // If verified, stop searching
              if (verification.valid) {
                break;
              }
            }
          }
        }
      }
    } else {
      console.log("[Research] HUNTER_API_KEY not set, skipping email lookup");
    }

    console.log(
      "[Research] Complete. Contact:",
      contact ? "YES" : "NO",
      "| Verified:",
      contact?.verified ? "YES" : "NO"
    );

    return NextResponse.json({ ...intel, contact });
  } catch (err) {
    console.log("[Research] Fatal error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
