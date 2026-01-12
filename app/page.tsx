"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Day1Page() {
  const [status, setStatus] = useState("");

  const processResume = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus("Uploading to Storage...");
    const { data: uploadData } = await supabase.storage
      .from("resumes")
      .upload(`public/${Date.now()}_${file.name}`, file);

    setStatus("AI Parsing in progress...");
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/parse", { method: "POST", body: formData });
    const { parsed, rawText } = await res.json();

    setStatus("Saving to DB...");
    await supabase.from("resumes").insert({
      file_name: file.name,
      parsed_json: parsed,
      raw_text: rawText,
    });

    setStatus("Complete! Ready for Day 2.");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6">
      <h1 className="text-3xl font-bold">ScholarReach MVP</h1>
      <div className="border-2 border-dashed p-10 rounded-lg text-center">
        <input
          type="file"
          onChange={processResume}
          className="cursor-pointer"
        />
        <p className="mt-4 text-sm text-gray-500">{status}</p>
      </div>
    </div>
  );
}
