Building a "barebones" MVP means focusing on the **Value-to-Effort ratio**. In 2026, the value isn't "sending emails"—it's the **intelligence** of the email. People will pay for this if it saves them 20 minutes of research per email and yields a higher reply rate.

Since we are skipping Auth, we will build a **"Session-Based" Dashboard**. Think of it like a "Calculator" for cold emails.

---

## 💎 The MVP Value Proposition

**"ScholarReach AI: Get a research position or startup internship without spending 10 hours a week on emails."**

* **Input:** Your Resume + Target URL (Startup/Lab).
* **Output:** A 125-word email that references their specific recent work and connects it to your specific skills.
* **Price:** $10 for 30 "Deep-Research" credits (Stripe Payment Link).

---

## 🛠️ Step-by-Step Breakdown (The 1-Week "Blitz")

### Day 1: The Intake (Resume Parser) — *Done*

You have the resume parsing working. The goal is to have a "Profile" state in your app that holds your extracted skills and interests.

### Day 2: The "Spy" Agent (Research)

Don't build a scraper. Use **Firecrawl** or **Perplexity API**.

* **Task:** Create an API route `/api/research`.
* **Logic:** It takes a URL  Scrapes the site  Uses an LLM to summarize: "What is this company/lab currently obsessed with?"
* **Goal:** A JSON object like: `{ "current_project": "LLM Quantization", "recent_news": "Raised Series A", "tech_stack": ["PyTorch", "Rust"] }`.

### Day 3: The "Ghostwriter" (Prompt Engineering)

This is your core product. Use **Claude 3.5 Sonnet** for the best "human" prose.

* **The Prompt:** Combine the **Day 1 JSON (User)** and **Day 2 JSON (Target)**.
* **Constraint:** "Write a cold email under 125 words. Do NOT use corporate jargon. Mention [Specific Project] from the research and explain how [User Skill] helps them specifically."
* **Goal:** A button that generates a high-quality draft in 5 seconds.

### Day 4: The "Command Center" UI

Keep it a single-page app (SPA).

* **Left Side:** Upload Resume (Persistent in local storage so they don't have to re-upload).
* **Right Side:** A list of "Targets."
* Input field: `Paste URL here`.
* Button: `Generate Research & Email`.


* **Result:** The email appears in a text box with a "Copy to Clipboard" button.

### Day 5: "Monetization" (The "Stripe Link" Hack)

Don't build a checkout system. That takes days.

* **The Hack:** Create a **Stripe Payment Link** manually in the Stripe Dashboard.
* **The UI:** Put a big button: *"Get 20 more AI-Researched Emails for $10."*
* **The Fulfillment:** When they pay, Stripe sends you an email. For the MVP, you can manually email them a "Key" or just use **Stripe's "Customer Portal"** to verify.

### Day 6: The "Safe Sender" (Deliverability)

Since you aren't building a full CRM, just give them a **"Open in Gmail"** link.

* **Logic:** Use a `mailto:` link with pre-filled `subject` and `body`.
* **Benefit:** Zero risk of your app getting banned for spam; the user sends it from their own authenticated account.

### Day 7: Testing & Launch

* Find 5 friends at NUS.
* Give them 5 free "credits."
* Ask: "Would you pay $10 to do this for 20 more companies?"
* If they say yes, **launch on LinkedIn and the NUS CS Telegram.**

---

## 📂 The "Barebones" Tech Stack

| Component | Tool | Why? |
| --- | --- | --- |
| **Scraping** | **Firecrawl** | Returns clean Markdown. AI loves Markdown. |
| **Logic** | **Claude 3.5 Sonnet** | Best at "not sounding like an AI bot." |
| **Storage** | **LocalStorage** | No Auth? Just save their data in their browser. |
| **Payments** | **Stripe Payment Link** | Zero code required. |

---

### Why this is "Pay-worthy":

A student applying for a specialized AI internship doesn't want to send 1,000 emails. They want to send 10 emails to the **right** people. Your tool does the heavy lifting of reading the target's GitHub or latest paper—that is the "Robust" part they will pay for.

**Would you like me to write the "Day 2" Research logic using Firecrawl to get the startup/lab data?**