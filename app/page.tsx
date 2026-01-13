"use client";
import { useState } from "react";

export default function Day1Page() {
  const [status, setStatus] = useState("");
  const [isWorking, setIsWorking] = useState(false);

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
      const { error, storagePath } = payload ?? {};
      if (!res.ok || error) {
        throw new Error(error || "Parsing failed");
      }

      setStatus(`Done! Parsed JSON stored at: ${storagePath ?? "(unknown)"}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setStatus(`Error: ${message}`);
    } finally {
      setIsWorking(false);
      // Allow re-uploading the same file by resetting the input.
      e.target.value = "";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6">
      <h1 className="text-3xl font-bold">ScholarReach MVP</h1>
      <div className="border-2 border-dashed p-10 rounded-lg text-center">
        <input
          type="file"
          accept="application/pdf"
          onChange={processResume}
          disabled={isWorking}
          className="cursor-pointer"
        />
        <p className="mt-4 text-sm text-gray-500">{status}</p>
      </div>
    </div>
  );
}
