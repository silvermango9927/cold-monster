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
      }),
    )
    .describe(
      "Names of founders, executives, or team leads mentioned on the site",
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
  apiKey: string,
): Promise<{ valid: boolean; status: string; score: number }> {
  try {
    const url = `https://api.hunter.io/v2/email-verifier?email=${encodeURIComponent(
      email,
    )}&api_key=${apiKey}`;
    console.log("[Hunter Email Verifier] Verifying:", email);
    const res = await fetch(url);
    const data = await res.json();
    console.log(
      "[Hunter Email Verifier] Response:",
      JSON.stringify(data?.data, null, 2),
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
  apiKey: string,
): Promise<{ email: string; score: number } | null> {
  try {
    const url = `https://api.hunter.io/v2/email-finder?domain=${encodeURIComponent(
      domain,
    )}&first_name=${encodeURIComponent(
      firstName,
    )}&last_name=${encodeURIComponent(lastName)}&api_key=${apiKey}`;
    console.log(
      "[Hunter Email Finder] Trying:",
      firstName,
      lastName,
      "@",
      domain,
    );
    const res = await fetch(url);
    const data = await res.json();
    console.log(
      "[Hunter Email Finder] Response:",
      JSON.stringify(data, null, 2),
    );
    if (data?.data?.email) {
      return { email: data.data.email, score: data.data.score ?? 0 };
    }
  } catch (e) {
    console.log("[Hunter Email Finder] Error:", e);
  }
  return null;
}

// Enhanced Hunter.io domain search with comprehensive page discovery
async function hunterDomainSearchEnhanced(
  domain: string,
  apiKey: string,
): Promise<HunterEmail[]> {
  const allEmails: Map<string, HunterEmail> = new Map();

  // 1) Primary domain search
  console.log("[Hunter Enhanced] Searching primary domain:", domain);
  try {
    const hunterUrl = `https://api.hunter.io/v2/domain-search?domain=${domain}&api_key=${apiKey}&limit=100`;
    const hunterRes = await fetch(hunterUrl);
    const hunterData = await hunterRes.json();
    console.log(
      "[Hunter Enhanced] Primary domain email count:",
      hunterData?.data?.emails?.length ?? 0,
    );

    const emails: HunterEmail[] = hunterData?.data?.emails ?? [];
    emails.forEach((email) => {
      if (email.value) {
        allEmails.set(email.value.toLowerCase(), email);
      }
    });
  } catch (e) {
    console.log("[Hunter Enhanced] Primary domain search error:", e);
  }

  // 2) Try common subdomains that often have different email patterns
  const subdomains = [
    `www.${domain}`,
    `mail.${domain}`,
    `blog.${domain}`,
    `careers.${domain}`,
    `jobs.${domain}`,
    `team.${domain}`,
    `people.${domain}`,
    `about.${domain}`,
  ];

  for (const subdomain of subdomains) {
    try {
      console.log("[Hunter Enhanced] Searching subdomain:", subdomain);
      const subUrl = `https://api.hunter.io/v2/domain-search?domain=${subdomain}&api_key=${apiKey}&limit=50`;
      const subRes = await fetch(subUrl);
      const subData = await subRes.json();

      const subEmails: HunterEmail[] = subData?.data?.emails ?? [];
      console.log(
        "[Hunter Enhanced] Subdomain",
        subdomain,
        "email count:",
        subEmails.length,
      );

      subEmails.forEach((email) => {
        if (email.value && !allEmails.has(email.value.toLowerCase())) {
          allEmails.set(email.value.toLowerCase(), email);
        }
      });

      // Stop if we've found enough emails
      if (allEmails.size >= 20) {
        console.log(
          "[Hunter Enhanced] Found sufficient emails, stopping subdomain search",
        );
        break;
      }
    } catch (e) {
      console.log("[Hunter Enhanced] Subdomain search error for", subdomain, e);
    }
  }

  // 3) Try alternative TLDs if the domain doesn't have many results
  if (allEmails.size < 5) {
    const baseDomain = domain.split(".")[0];
    const altTLDs = [".com", ".io", ".co", ".org", ".net"];
    const currentTLD = "." + domain.split(".").slice(1).join(".");

    for (const tld of altTLDs) {
      if (tld === currentTLD) continue;
      const altDomain = baseDomain + tld;

      try {
        console.log("[Hunter Enhanced] Trying alternative TLD:", altDomain);
        const altUrl = `https://api.hunter.io/v2/domain-search?domain=${altDomain}&api_key=${apiKey}&limit=50`;
        const altRes = await fetch(altUrl);
        const altData = await altRes.json();

        const altEmails: HunterEmail[] = altData?.data?.emails ?? [];
        console.log(
          "[Hunter Enhanced] Alt TLD",
          altDomain,
          "email count:",
          altEmails.length,
        );

        altEmails.forEach((email) => {
          if (email.value && !allEmails.has(email.value.toLowerCase())) {
            allEmails.set(email.value.toLowerCase(), email);
          }
        });

        if (allEmails.size >= 10) break;
      } catch (e) {
        console.log("[Hunter Enhanced] Alt TLD search error for", altDomain, e);
      }
    }
  }

  console.log("[Hunter Enhanced] Total unique emails found:", allEmails.size);
  return Array.from(allEmails.values());
}

// Extract emails from scraped page content using regex
function extractEmailsFromContent(content: string, domain: string): string[] {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const matches = content.match(emailRegex) || [];

  // Filter to only include emails from the target domain or similar
  const domainBase = domain.split(".")[0].toLowerCase();
  const filtered = matches.filter((email) => {
    const emailDomain = email.split("@")[1]?.toLowerCase() || "";
    return (
      emailDomain.includes(domainBase) ||
      emailDomain === domain.toLowerCase()
    );
  });

  // Deduplicate
  return [...new Set(filtered)];
}

// Discover additional pages on the website that might contain contact info
async function discoverContactPages(
  baseUrl: string,
  mainMarkdown: string,
): Promise<string[]> {
  const discoveredUrls: Set<string> = new Set();
  const baseHost = new URL(baseUrl).hostname;

  // Extract links from main page content
  const linkRegex =
    /\[([^\]]*)\]\(([^)]+)\)|href=["']([^"']+)["']|(?:^|\s)(\/[a-zA-Z0-9\-_/]+)/gm;
  let match;

  while ((match = linkRegex.exec(mainMarkdown)) !== null) {
    const link = match[2] || match[3] || match[4];
    if (!link) continue;

    try {
      // Convert relative URLs to absolute
      const absoluteUrl = link.startsWith("http")
        ? link
        : new URL(link, baseUrl).toString();
      const urlHost = new URL(absoluteUrl).hostname;

      // Only include URLs from the same domain
      if (urlHost === baseHost || urlHost === `www.${baseHost}`) {
        const pathname = new URL(absoluteUrl).pathname.toLowerCase();

        // Look for pages that likely contain contact/team info
        const contactKeywords = [
          "contact",
          "team",
          "about",
          "people",
          "leadership",
          "founders",
          "management",
          "staff",
          "who-we-are",
          "our-team",
          "meet-the-team",
          "executive",
          "board",
          "company",
        ];

        if (contactKeywords.some((kw) => pathname.includes(kw))) {
          discoveredUrls.add(absoluteUrl);
        }
      }
    } catch {
      // Invalid URL, skip
    }
  }

  return Array.from(discoveredUrls).slice(0, 5); // Limit to 5 additional pages
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
        { status: 500 },
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

    if (!scrapeResult?.success || !scrapeResult.markdown) {
      console.log("[Research] Main site scrape failed");
      return NextResponse.json(
        { error: "Failed to scrape target website" },
        { status: 502 },
      );
    }

    // 2) Discover and scrape additional contact-related pages
    console.log("[Research] Step 2: Discovering additional pages...");
    const discoveredPages = await discoverContactPages(url, scrapeResult.markdown);
    console.log("[Research] Discovered", discoveredPages.length, "additional contact pages");

    // Best-effort: also try common careers/jobs/about/team paths
    const allMarkdown: string[] = [scrapeResult.markdown];
    const altPaths = ["/careers", "/jobs", "/about", "/team", "/about-us", "/contact", "/leadership", "/people", "/our-team"];
    const pathsToScrape = new Set([
      ...altPaths.map((p) => new URL(p, url).toString()),
      ...discoveredPages,
    ]);

    console.log("[Research] Scraping", pathsToScrape.size, "additional paths...");
    for (const altUrl of pathsToScrape) {
      try {
        const alt = await firecrawl.scrapeUrl(altUrl, {
          formats: ["markdown"],
        });
        if (alt?.success && alt.markdown) {
          console.log("[Research] Scraped:", altUrl);
          allMarkdown.push(alt.markdown);
        }
      } catch {
        // ignore
      }
    }

    console.log("[Research] Total pages scraped:", allMarkdown.length);

    // 3) Extract emails directly from all scraped content
    console.log("[Research] Step 3: Extracting emails from scraped content...");
    const combinedContent = allMarkdown.join("\n\n");
    const scrapedEmails = extractEmailsFromContent(combinedContent, domain);
    console.log("[Research] Found", scrapedEmails.length, "emails in scraped content:", scrapedEmails);

    // 4) Ask LLM to extract structured intel from the scraped markdown
    console.log("[Research] Step 4: Extracting intel via LLM...");
    const combinedMarkdown = combinedContent.slice(0, 30000); // Increased limit for more context

    const { object: intel } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: ResearchSchema,
      prompt: `${prompts.RESEARCH_EXTRACT}

Scraped markdown:
${combinedMarkdown}`,
    });

    console.log(
      "[Research] LLM extracted intel:",
      JSON.stringify(intel, null, 2),
    );

    // 5) Try Hunter.io Enhanced Domain Search
    let contact: Contact | null = null;

    if (process.env.HUNTER_API_KEY) {
      console.log("[Research] Step 5: Trying Hunter.io Enhanced Domain Search...");
      
      // Get all emails from Hunter.io (primary domain + subdomains + alt TLDs)
      const hunterEmails = await hunterDomainSearchEnhanced(
        domain,
        process.env.HUNTER_API_KEY,
      );

      // Also add any scraped emails to our pool (convert to HunterEmail format)
      const allEmails: HunterEmail[] = [...hunterEmails];
      for (const scrapedEmail of scrapedEmails) {
        if (!allEmails.some((e) => e.value?.toLowerCase() === scrapedEmail.toLowerCase())) {
          allEmails.push({
            value: scrapedEmail,
            type: "scraped",
          });
        }
      }

      console.log("[Research] Total emails to evaluate:", allEmails.length);

      if (allEmails.length > 0) {
        console.log(
          "[Hunter Domain Search] Scoring",
          allEmails.length,
          "emails...",
        );
        const ranked = allEmails
          .map((email) => ({
            email,
            score: scoreEmail(email, intel.targetRole),
          }))
          .sort((a, b) => b.score - a.score);

        console.log("[Hunter Domain Search] Top 5 ranked emails:");
        ranked.slice(0, 5).forEach((r, i) => {
          console.log(
            `  ${i + 1}. ${r.email.value} (${
              r.email.position || "no position"
            }) - score: ${r.score}`,
          );
        });

        // Try to verify the top ranked emails until we find a valid one
        for (const { email: best } of ranked.slice(0, 10)) {
          if (best && best.value) {
            const verification = await verifyEmail(
              best.value,
              process.env.HUNTER_API_KEY!,
            );
            console.log(
              "[Hunter Domain Search] Email verification for",
              best.value,
              ":",
              verification.status,
              "score:",
              verification.score,
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
                JSON.stringify(contact, null, 2),
              );
              break;
            } else {
              console.log(
                "[Hunter Domain Search] Email not verified, trying next...",
              );
            }
          }
        }

        if (contact) {
          console.log(
            "[Hunter Domain Search] Selected contact:",
            JSON.stringify(contact, null, 2),
          );
        }
      } else {
        console.log("[Hunter Domain Search] No emails found for domain");
      }

      // 6) If no contact from domain search, try Email Finder with extracted names
      if (!contact && intel.keyPeople && intel.keyPeople.length > 0) {
        console.log(
          "[Research] Step 6: Trying Hunter.io Email Finder with",
          intel.keyPeople.length,
          "key people...",
        );
        for (const person of intel.keyPeople.slice(0, 5)) {
          if (person.firstName && person.lastName) {
            const found = await hunterEmailFinder(
              domain,
              person.firstName,
              person.lastName,
              process.env.HUNTER_API_KEY!,
            );
            if (found && found.email) {
              // Verify the found email
              const verification = await verifyEmail(
                found.email,
                process.env.HUNTER_API_KEY!,
              );
              console.log(
                "[Hunter Email Finder] Email verification for",
                found.email,
                ":",
                verification.status,
                "score:",
                verification.score,
              );

              contact = {
                name: `${person.firstName} ${person.lastName}`,
                email: found.email,
                position: person.role || intel.targetRole,
                verified: verification.valid,
              };
              console.log(
                "[Hunter Email Finder] Found email:",
                JSON.stringify(contact, null, 2),
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
      contact?.verified ? "YES" : "NO",
    );

    return NextResponse.json({ ...intel, contact });
  } catch (err) {
    console.log("[Research] Fatal error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
