"use client";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Icons (inline SVGs for simplicity)
const Icons = {
  upload: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
      />
    </svg>
  ),
  search: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  ),
  sparkles: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
      />
    </svg>
  ),
  refresh: (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  ),
  send: (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
      />
    </svg>
  ),
  check: (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  ),
  mail: (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  ),
};
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Icons (inline SVGs for simplicity)
const Icons = {
  upload: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
      />
    </svg>
  ),
  search: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  ),
  sparkles: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
      />
    </svg>
  ),
  refresh: (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  ),
  send: (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
      />
    </svg>
  ),
  check: (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  ),
  mail: (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  ),
};

interface ResumeData {
  name: string;
  email: string | null;
  skills: string[];
  experience_score: number;
  summary: string;
}

interface ResearchData {
  companyName: string;
  mission: string;
  recentProjects: string[];
  idealCandidateTraits: string[];
  techStack: string[];
  targetRole: string;
  keyPeople?: { firstName: string; lastName: string; role: string | null }[];
  contact?: {
    name: string;
    email: string;
    position: string;
    verified: boolean;
  } | null;
}

interface EmailDraft {
  subject: string;
  body: string;
}

type AppStep = "setup" | "compose";

export default function ScholarReachPage() {
  // Setup state
  const [step, setStep] = useState<AppStep>("setup");
interface EmailDraft {
  subject: string;
  body: string;
}

type AppStep = "setup" | "compose";

export default function ScholarReachPage() {
  // Setup state
  const [step, setStep] = useState<AppStep>("setup");
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [researchData, setResearchData] = useState<ResearchData | null>(null);
  const [researchData, setResearchData] = useState<ResearchData | null>(null);
  const [targetUrl, setTargetUrl] = useState("");
  const [targetRole, setTargetRole] = useState("");

  // Loading states
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [isResearching, setIsResearching] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  // Email state
  const [emailDraft, setEmailDraft] = useState<EmailDraft | null>(null);
  const [editedSubject, setEditedSubject] = useState("");
  const [editedBody, setEditedBody] = useState("");

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Handle resume upload
  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  // Email state
  const [emailDraft, setEmailDraft] = useState<EmailDraft | null>(null);
  const [editedSubject, setEditedSubject] = useState("");
  const [editedBody, setEditedBody] = useState("");

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Handle resume upload
  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingResume(true);
      setIsUploadingResume(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/parse", {
        method: "POST",
        body: formData,
      });

      const payload = await res.json();
      if (!res.ok || payload.error) {
        throw new Error(payload.error || "Failed to parse resume");
      if (!res.ok || payload.error) {
        throw new Error(payload.error || "Failed to parse resume");
      }

      setResumeData(payload.data);
      toast.success("Resume parsed successfully!");
      setResumeData(payload.data);
      toast.success("Resume parsed successfully!");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Resume upload failed: ${message}`);
      toast.error(`Resume upload failed: ${message}`);
    } finally {
      setIsUploadingResume(false);
      setIsUploadingResume(false);
      e.target.value = "";
    }
  };

  // Handle target research
  const handleResearch = async () => {
  // Handle target research
  const handleResearch = async () => {
    if (!targetUrl.trim()) {
      toast.error("Please enter a target URL");
      toast.error("Please enter a target URL");
      return;
    }

    try {
      setIsResearching(true);
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl }),
      });

      const payload = await res.json();
      if (!res.ok || payload.error) {
        throw new Error(payload.error || "Research failed");
      }

      setResearchData(payload);
      toast.success("Research complete!");
      toast.success("Research complete!");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Research failed: ${message}`);
      toast.error(`Research failed: ${message}`);
    } finally {
      setIsResearching(false);
    }
  };

  // Generate email draft
  const generateDraft = async (tone?: string) => {
    console.log("[Frontend] generateDraft called with tone:", tone);
    console.log("[Frontend] resumeData:", resumeData);
    console.log("[Frontend] researchData:", researchData);

    if (!resumeData || !researchData) {
      console.log(
        "[Frontend] Missing data - resumeData:",
        !!resumeData,
        "researchData:",
        !!researchData
      );
      toast.error("Please complete setup first");
      return;
    }

    try {
      setIsGenerating(true);
      console.log("[Frontend] Sending request to /api/generate...");

      const requestBody = {
        resumeData,
        targetIntel: researchData,
        pocName: researchData.contact?.name || "Hiring Team",
        tone: tone || "casual",
        targetRole: targetRole || "Software Engineer",
      };
      console.log("[Frontend] Request body:", requestBody);

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      console.log("[Frontend] Response status:", res.status);
      const payload = await res.json();
      console.log("[Frontend] Response payload:", payload);

      if (!res.ok || payload.error) {
        throw new Error(payload.error || "Generation failed");
      }

      if (!payload.subject || !payload.body) {
        console.log("[Frontend] Invalid payload - missing subject or body");
        throw new Error("Invalid response - missing subject or body");
      }

      setEmailDraft(payload);
      setEditedSubject(payload.subject);
      setEditedBody(payload.body);
      console.log("[Frontend] Draft set successfully!");
      toast.success("Draft generated!");
    } catch (err) {
      console.error("[Frontend] Generation error:", err);
      const message = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Generation failed: ${message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Initiate Google sign-in
  const signInWithGoogle = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const payload = await res.json();
      if (payload.url) {
        window.location.href = payload.url;
      } else {
        throw new Error(payload.error || "Failed to start Google sign-in");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Sign-in failed: ${message}`);
    }
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/signout", {
        method: "POST",
      });
      const payload = await res.json();
      if (payload.success) {
        setIsAuthenticated(false);
        setUserEmail(null);
        toast.success("Signed out successfully");
      } else {
        throw new Error(payload.error || "Failed to sign out");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Sign-out failed: ${message}`);
    }
  }, []);

  // Check auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/check");
        const data = await res.json();
        setIsAuthenticated(data.authenticated && data.hasGoogleToken);
        setUserEmail(data.user?.email || null);
      } catch (err) {
        console.error("Auth check failed:", err);
      }
    };
    checkAuth();

    const params = new URLSearchParams(window.location.search);
    if (params.get("auth") === "success") {
      toast.success("Signed in with Google!");
      checkAuth(); // Refresh auth state
      // Clean up URL
      window.history.replaceState({}, "", window.location.pathname);
    } else if (params.get("error") === "auth_failed") {
      toast.error("Google sign-in failed. Please try again.");
      // Clean up URL
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  // Save to Gmail drafts
  const saveToDrafts = async () => {
    if (!researchData?.contact?.email) {
      toast.error("No recipient email found");
      return;
    }

    try {
      setIsSavingDraft(true);
      const res = await fetch("/api/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient: researchData.contact.email,
          subject: editedSubject,
          body: editedBody,
        }),
      });

      const payload = await res.json();

      // Handle auth requirement
      if (payload.needsAuth) {
        toast.error("Please sign in with Google to save drafts", {
          action: {
            label: "Sign In",
            onClick: signInWithGoogle,
          },
          duration: 10000,
        });
        return;
      }

      if (!res.ok || payload.error) {
        throw new Error(payload.error || "Failed to save draft");
      }

      toast.success("Draft saved to Gmail!");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Failed to save draft: ${message}`);
    } finally {
      setIsSavingDraft(false);
    }
  };

  // Proceed to compose step
  const proceedToCompose = () => {
    console.log("[Frontend] proceedToCompose called");
    console.log("[Frontend] Checking resumeData:", !!resumeData);
    console.log("[Frontend] Checking researchData:", !!researchData);
    console.log(
      "[Frontend] Checking contact email:",
      researchData?.contact?.email
    );

    if (!resumeData) {
      toast.error("Please upload your resume first");
      return;
    }
    if (!researchData) {
      toast.error("Please research a target company first");
      return;
    }
    if (!researchData.contact?.email) {
      toast.error("No contact email found for this company");
      return;
    }
    console.log("[Frontend] All checks passed, proceeding to compose...");
    setStep("compose");
    generateDraft();
  };

  // Setup View
  if (step === "setup") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="flex justify-between items-start mb-12">
            <div className="flex-1" />
            <div className="text-center flex-1">
              <h1 className="text-4xl font-bold tracking-tight mb-2">
                ScholarReach
              </h1>
              <p className="text-muted-foreground text-lg">
                AI-powered cold outreach for CS students
              </p>
            </div>
            <div className="flex-1 flex justify-end">
              {isAuthenticated ? (
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-muted-foreground">{userEmail}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={signOut}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={signInWithGoogle}>
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign in with Google
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {/* Step 1: Resume Upload */}
            <Card
              className={
                resumeData
                  ? "border-green-500/50 bg-green-50/50 dark:bg-green-950/20"
                  : ""
              }
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-full ${
                      resumeData ? "bg-green-500" : "bg-primary"
                    }`}
                  >
                    {resumeData ? (
                      <span className="text-white">{Icons.check}</span>
                    ) : (
                      <span className="text-primary-foreground">
                        {Icons.upload}
                      </span>
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-xl">
                      1. Upload Your Resume
                    </CardTitle>
                    <CardDescription>
                      We&apos;ll extract your skills and experience
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {!resumeData ? (
                  <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handleResumeUpload}
                      disabled={isUploadingResume}
                      className="hidden"
                      id="resume-upload"
                    />
                    <label
                      htmlFor="resume-upload"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <div className="p-3 bg-primary/10 rounded-full">
                        {Icons.upload}
                      </div>
                      <span className="font-medium">
                        {isUploadingResume
                          ? "Parsing..."
                          : "Click to upload PDF"}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        or drag and drop
                      </span>
                    </label>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-lg">
                        {resumeData.name}
                      </span>
                      <Badge variant="secondary">
                        Score: {resumeData.experience_score}/10
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {resumeData.summary}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {resumeData.skills.slice(0, 6).map((skill) => (
                        <Badge key={skill} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                      {resumeData.skills.length > 6 && (
                        <Badge variant="outline">
                          +{resumeData.skills.length - 6} more
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setResumeData(null)}
                      className="text-muted-foreground"
                    >
                      Upload different resume
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Step 2: Research Target */}
            <Card
              className={
                researchData
                  ? "border-green-500/50 bg-green-50/50 dark:bg-green-950/20"
                  : ""
              }
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-full ${
                      researchData ? "bg-green-500" : "bg-primary"
                    }`}
                  >
                    {researchData ? (
                      <span className="text-white">{Icons.check}</span>
                    ) : (
                      <span className="text-primary-foreground">
                        {Icons.search}
                      </span>
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-xl">
                      2. Research Target Company
                    </CardTitle>
                    <CardDescription>
                      We&apos;ll gather intel and find the right contact
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {!researchData ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Target Role</label>
                      <Input
                        type="text"
                        placeholder="e.g., Software Engineer, Product Manager, Data Scientist"
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        disabled={isResearching}
                        className="mb-3"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Company Website</label>
                      <div className="flex gap-2">
                        <Input
                          type="url"
                          placeholder="https://startup.com"
                          value={targetUrl}
                          onChange={(e) => setTargetUrl(e.target.value)}
                          disabled={isResearching}
                          className="flex-1"
                        />
                        <Button
                          onClick={handleResearch}
                          disabled={isResearching || !targetUrl.trim()}
                        >
                          {isResearching ? "Researching..." : "Research"}
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Enter the role you&apos;re applying for and the company&apos;s website URL.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-lg">
                        {researchData.companyName}
                      </span>
                      {researchData.contact && (
                        <Badge
                          variant={
                            researchData.contact.verified
                              ? "default"
                              : "secondary"
                          }
                        >
                          {researchData.contact.verified
                            ? "✓ Verified Contact"
                            : "Contact Found"}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {researchData.mission}
                    </p>
                    {researchData.contact && (
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium">
                          {researchData.contact.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {researchData.contact.position}
                        </p>
                        <p className="text-sm text-primary">
                          {researchData.contact.email}
                        </p>
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setResearchData(null);
                        setTargetUrl("");
                      }}
                      className="text-muted-foreground"
                    >
                      Research different company
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Continue Button */}
            <div className="flex justify-center pt-4">
              <Button
                size="lg"
                onClick={proceedToCompose}
                disabled={
                  !resumeData || !researchData || !researchData.contact?.email
                }
                className="gap-2"
              >
                {Icons.sparkles}
                Generate Outreach Email
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Compose View - Split Pane Layout
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setStep("setup")}>
              ← Back
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <span className="font-semibold">
              Composing for {researchData?.companyName}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => generateDraft()}
                disabled={isGenerating}
                className="gap-1"
              >
                {Icons.refresh}
                Regenerate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => generateDraft("formal")}
                disabled={isGenerating}
              >
                More Formal
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => generateDraft("friendly")}
                disabled={isGenerating}
              >
                More Friendly
              </Button>
            </div>
            <Separator orientation="vertical" className="h-6" />
            {isAuthenticated ? (
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-muted-foreground truncate max-w-[150px]">
                  {userEmail}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={signOut}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={signInWithGoogle}>
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Split Pane Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-2 gap-6 h-[calc(100vh-180px)]">
          {/* Left Pane - The Dossier */}
          <div className="space-y-4 overflow-y-auto pr-2">
            <h2 className="text-lg font-semibold text-muted-foreground uppercase tracking-wide">
              Startup Dossier
            </h2>

            {/* Company Overview */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Company Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Company
                  </span>
                  <p className="font-semibold">{researchData?.companyName}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Mission
                  </span>
                  <p className="text-sm">
                    {researchData?.mission || "Not available"}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Target Role
                  </span>
                  <p className="text-sm">{researchData?.targetRole}</p>
                </div>
              </CardContent>
            </Card>

            {/* Tech Stack */}
            {researchData?.techStack && researchData.techStack.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Tech Stack</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {researchData.techStack.map((tech) => (
                      <Badge key={tech} variant="secondary">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Projects */}
            {researchData?.recentProjects &&
              researchData.recentProjects.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Recent Projects</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {researchData.recentProjects.map((project, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <span className="text-primary">•</span>
                          {project}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

            {/* Ideal Candidate */}
            {researchData?.idealCandidateTraits &&
              researchData.idealCandidateTraits.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      What They&apos;re Looking For
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {researchData.idealCandidateTraits.map((trait) => (
                        <Badge key={trait} variant="outline">
                          {trait}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

            {/* Contact */}
            {researchData?.contact && (
              <Card className="border-primary/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    {Icons.mail}
                    Recipient
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <p className="font-medium">{researchData.contact.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {researchData.contact.position}
                    </p>
                    <p className="text-sm text-primary">
                      {researchData.contact.email}
                    </p>
                    {researchData.contact.verified && (
                      <Badge variant="default" className="mt-2">
                        ✓ Verified Email
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Your Profile Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Your Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-medium">{resumeData?.name}</p>
                <p className="text-sm text-muted-foreground">
                  {resumeData?.summary}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {resumeData?.skills.slice(0, 5).map((skill) => (
                    <Badge key={skill} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Pane - The Editor */}
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold text-muted-foreground uppercase tracking-wide mb-4">
              Email Draft
            </h2>

            <Card className="flex-1 flex flex-col">
              <CardContent className="flex-1 flex flex-col p-4 space-y-4">
                {isGenerating ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center space-y-3">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="text-muted-foreground">
                        Crafting your email...
                      </p>
                    </div>
                  </div>
                ) : emailDraft ? (
                  <>
                    {/* To Field */}
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-muted-foreground">
                        To
                      </label>
                      <Input
                        value={researchData?.contact?.email || ""}
                        disabled
                        className="bg-muted"
                      />
                    </div>

                    {/* Subject Field */}
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-muted-foreground">
                        Subject
                      </label>
                      <Input
                        value={editedSubject}
                        onChange={(e) => setEditedSubject(e.target.value)}
                        placeholder="Email subject..."
                      />
                    </div>

                    {/* Body Field */}
                    <div className="space-y-1 flex-1 flex flex-col">
                      <label className="text-sm font-medium text-muted-foreground">
                        Message
                      </label>
                      <Textarea
                        value={editedBody}
                        onChange={(e) => setEditedBody(e.target.value)}
                        placeholder="Email body..."
                        className="flex-1 min-h-[300px] resize-none"
                      />
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center space-y-3">
                      <p className="text-muted-foreground">
                        No draft generated yet
                      </p>
                      <Button onClick={() => generateDraft()}>
                        Generate Draft
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Bar */}
            {emailDraft && !isGenerating && (
              <div className="mt-4 flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditedSubject(emailDraft.subject);
                    setEditedBody(emailDraft.body);
                  }}
                >
                  Reset Changes
                </Button>
                <Button
                  onClick={saveToDrafts}
                  disabled={isSavingDraft || !editedSubject || !editedBody}
                  className="gap-2"
                >
                  {isSavingDraft ? (
                    "Saving..."
                  ) : (
                    <>
                      {Icons.send}
                      Save to Gmail Drafts
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
