"use client";
import { useState } from "react";

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

export default function Day1Page() {
  const [status, setStatus] = useState("");
  const [isWorking, setIsWorking] = useState(false);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);

  const [targetUrl, setTargetUrl] = useState("");
  const [researchStatus, setResearchStatus] = useState("");
  const [isResearching, setIsResearching] = useState(false);
  const [researchData, setResearchData] = useState<ResearchData | null>(null);

  const processResume = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setStatus("AI Parsing in progress...");
      setIsWorking(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/parse", {
        method: "POST",
        body: formData,
      });

      const payload = await res.json();
      const { data, error, storagePath } = payload ?? {};
      if (!res.ok || error) {
        throw new Error(error || "Parsing failed");
      }

      setResumeData(data);
      setStatus(`Done! Parsed JSON stored at: ${storagePath ?? "(unknown)"}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setStatus(`Error: ${message}`);
    } finally {
      setIsWorking(false);
      e.target.value = "";
    }
  };

  const researchTarget = async () => {
    if (!targetUrl.trim()) {
      setResearchStatus("Please enter a URL");
      return;
    }

    try {
      setResearchStatus("Researching target...");
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
      setResearchStatus("Research complete!");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setResearchStatus(`Error: ${message}`);
    } finally {
      setIsResearching(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-8">
      <h1 className="text-3xl font-bold">ScholarReach MVP</h1>

      {/* Resume Upload Section */}
      <div className="w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">1. Upload Resume</h2>
        <div className="border-2 border-dashed p-6 rounded-lg text-center">
          <input
            type="file"
            accept="application/pdf"
            onChange={processResume}
            disabled={isWorking}
            className="cursor-pointer"
          />
          <p className="mt-4 text-sm text-gray-500">{status}</p>
        </div>
        {resumeData && (
          <div className="mt-4 p-4 bg-gray-100 rounded-lg text-sm">
            <p>
              <strong>Name:</strong> {resumeData.name}
            </p>
            <p>
              <strong>Email:</strong> {resumeData.email ?? "N/A"}
            </p>
            <p>
              <strong>Skills:</strong> {resumeData.skills.join(", ")}
            </p>
            <p>
              <strong>Experience Score:</strong> {resumeData.experience_score}
              /10
            </p>
            <p>
              <strong>Summary:</strong> {resumeData.summary}
            </p>
          </div>
        )}
      </div>

      {/* Research Target Section */}
      <div className="w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">2. Research Target</h2>
        <div className="border-2 border-dashed p-6 rounded-lg">
          <input
            type="url"
            placeholder="Enter target URL (e.g., https://company.com)"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            disabled={isResearching}
            className="w-full p-2 border rounded mb-4"
          />
          <button
            onClick={researchTarget}
            disabled={isResearching || !targetUrl.trim()}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isResearching ? "Researching..." : "Research Target"}
          </button>
          <p className="mt-4 text-sm text-gray-500 text-center">
            {researchStatus}
          </p>
        </div>
        {researchData && (
          <div className="mt-4 p-4 bg-gray-100 rounded-lg text-sm">
            <p>
              <strong>Company:</strong> {researchData.companyName}
            </p>
            <p>
              <strong>Mission:</strong> {researchData.mission}
            </p>
            <p>
              <strong>Recent Projects:</strong>{" "}
              {researchData.recentProjects.join(", ")}
            </p>
            <p>
              <strong>Ideal Traits:</strong>{" "}
              {researchData.idealCandidateTraits.join(", ")}
            </p>
            <p>
              <strong>Tech Stack:</strong> {researchData.techStack.join(", ")}
            </p>
            <p>
              <strong>Target Role:</strong> {researchData.targetRole}
            </p>
            {researchData.keyPeople && researchData.keyPeople.length > 0 && (
              <p>
                <strong>Key People:</strong>{" "}
                {researchData.keyPeople
                  .map(
                    (p) =>
                      `${p.firstName} ${p.lastName}${
                        p.role ? ` (${p.role})` : ""
                      }`
                  )
                  .join(", ")}
              </p>
            )}
            {researchData.contact && (
              <div
                className={`mt-3 border-t pt-2 p-2 rounded ${
                  researchData.contact.verified ? "bg-green-50" : "bg-yellow-50"
                }`}
              >
                <p
                  className={`font-semibold ${
                    researchData.contact.verified
                      ? "text-green-800"
                      : "text-yellow-800"
                  }`}
                >
                  📧 Email Contact{" "}
                  {researchData.contact.verified
                    ? "✓ Verified"
                    : "⚠ Unverified"}
                </p>
                <p>
                  <strong>Name:</strong> {researchData.contact.name}
                </p>
                <p>
                  <strong>Email:</strong>{" "}
                  <a
                    href={`mailto:${researchData.contact.email}`}
                    className="text-blue-600 underline"
                  >
                    {researchData.contact.email}
                  </a>
                </p>
                <p>
                  <strong>Position:</strong> {researchData.contact.position}
                </p>
              </div>
            )}
            {!researchData.contact && (
              <div className="mt-3 border-t pt-2 p-2 rounded bg-gray-50">
                <p className="text-gray-600">
                  No email contact found for this company.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
