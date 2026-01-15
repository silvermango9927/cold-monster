/**
 * Prompts Configuration
 *
 * All AI prompts are loaded from environment variables for:
 * 1. Security - Keep proprietary prompts out of version control
 * 2. Easy iteration - Change prompts without code changes
 * 3. Environment-specific prompts - Different prompts for dev/prod
 *
 * Set these in your .env.local file
 */

// Default prompts (used as fallbacks if env vars not set)
const DEFAULTS = {
  RESUME_PARSE: `Extract the following fields from this resume text:
- name: Full name of the candidate
- email: Email address if present
- skills: Array of skills mentioned
- experience_score: Rate the candidate's experience from 1-10
- summary: Write a 2-sentence professional bio`,

  RESEARCH_EXTRACT: `You are a research assistant helping a CS student tailor outreach.
Extract concise, specific facts (no boilerplate). Use only what you find in the scraped markdown.
If any careers/jobs pages are present, prioritize role requirements, skills sought, and preferred backgrounds.
Extract names of any founders, executives, or team leads mentioned.`,

  EMAIL_SYSTEM: `You are an expert at startup cold outreach.
RULES:
- No formal greetings like "I hope this finds you well."
- Open with a specific reference to their tech or recent project.
- Connect exactly ONE skill from the user to that project.
- Max 100 words.`,

  EMAIL_TONE_CASUAL: "Tone: Casual, technical, peer-to-peer.",
  EMAIL_TONE_FORMAL: "Tone: Professional but warm, slightly formal.",
  EMAIL_TONE_FRIENDLY: "Tone: Very friendly, enthusiastic, conversational.",
};

export const prompts = {
  resumeParse: process.env.PROMPT_RESUME_PARSE || DEFAULTS.RESUME_PARSE,
  researchExtract:
    process.env.PROMPT_RESEARCH_EXTRACT || DEFAULTS.RESEARCH_EXTRACT,
  emailSystem: process.env.PROMPT_EMAIL_SYSTEM || DEFAULTS.EMAIL_SYSTEM,
  emailToneCasual:
    process.env.PROMPT_EMAIL_TONE_CASUAL || DEFAULTS.EMAIL_TONE_CASUAL,
  emailToneFormal:
    process.env.PROMPT_EMAIL_TONE_FORMAL || DEFAULTS.EMAIL_TONE_FORMAL,
  emailToneFriendly:
    process.env.PROMPT_EMAIL_TONE_FRIENDLY || DEFAULTS.EMAIL_TONE_FRIENDLY,
};

export function getEmailPrompt(tone?: string): string {
  const baseSystem = prompts.emailSystem;
  let toneInstruction = prompts.emailToneCasual;

  if (tone === "formal") {
    toneInstruction = prompts.emailToneFormal;
  } else if (tone === "friendly") {
    toneInstruction = prompts.emailToneFriendly;
  }

  return `${baseSystem}\n- ${toneInstruction}`;
}
