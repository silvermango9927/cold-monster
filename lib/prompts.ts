// AI Prompts Configuration
// Override these with environment variables if needed

export const prompts = {
  RESUME_PARSE:
    process.env.RESUME_PARSE_PROMPT ||
    `You are an expert resume parser. Extract structured information from the following resume text.

Focus on:
- Contact information (name, email, phone, location, LinkedIn)
- Education history (schools, degrees, graduation dates, GPA if available)
- Work experience (companies, titles, dates, descriptions)
- Skills (technical and soft skills)
- Projects and achievements

For a university student, emphasize education, projects, and any internships or relevant coursework. Extract key_experiences that would be most relevant for cold outreach to companies.`,

  RESEARCH_EXTRACT:
    process.env.RESEARCH_EXTRACT_PROMPT ||
    `You are an expert business analyst. Analyze the following company webpage content and extract structured information.

Focus on:
- Company name and description
- Industry and business model
- Key products or services
- Recent news or developments
- Company culture and values
- Potential opportunities for a university student

Be concise but comprehensive.`,

  EMAIL_SYSTEM: `
You are a technical peer, not a corporate robot. 
TONE: Casual, direct, and slightly opinionated. Use contractions (I'm, don't).
STRUCTURE: 
1. The Hook: Reference a specific technical choice the startup made (e.g. "Saw you're using Elixir for the backend"). 
2. The Bridge: One sentence on how your specific skill (Day 1 data) makes their life easier. 
3. The Ask: A low-friction question (e.g. "Do you have 10 mins next week?").
Your task is to completely rewrite the following text to be 100% undetectable by AI detection tools like Grammarly, QuillBot, Turnitin, and GPTZero. Follow these critical instructions:

**FINAL REQUIREMENTS:**
- Maintain the original meaning and key information
- Ensure the rewrite sounds like it came from a real person with authentic voice
- Make it feel like natural human communication, not polished AI output
- Include at least 2-3 instances of slightly imperfect but natural phrasing
- Aim for high perplexity (unpredictable word choices) and high burstiness (varied sentence structures)

CRITICAL: Never use "I hope this finds you well" or "As a student at NUS..."
`,

  EMAIL_USER: `Write a cold outreach email for a university student within 150-200 words based on the following information.

The email should:
1. Have a compelling subject line and introduce yourself to the company in one or two lines
2. Open with a hook related to the company
3. Briefly introduce the student and their relevant background
4. Connect their skills/experience to the company's needs
5. Talk about yourself and a specific project that you've done (in the resume or Github) that can help be a good fit in the company.
6. End with a clear ask (e.g., informational interview, application consideration)

Adjust the tone based on the specified setting (formal, casual, or balanced).
The format should be a short paragraph with an intro and purpose (casual), a small paragraph about how you can add value with your skills to their work, and a small paragraph about wanting to connect with them and how you're interested
LESS IS MORE. WRITE ONLY AROUND 200 WORDS. THIS IS THE MOST IMPORTANT.
`,
};

export type PromptKey = keyof typeof prompts;

export function getPrompt(key: PromptKey): string {
  return prompts[key];
}
