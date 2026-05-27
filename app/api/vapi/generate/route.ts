import OpenAI from "openai";

import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY!,
});

export async function POST(request: Request) {
  try {
    const { type, role, level, techstack, amount, userid } =
      await request.json();

    // 🔒 Basic validation
    if (!role || !level || !techstack || !amount || !userid) {
      return Response.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 🚀 Call OpenRouter (LLM)
    const completion = await openai.chat.completions.create({
      model: "mistralai/mixtral-8x7b-instruct",
      messages: [
        {
          role: "system",
          content:
            "You are an AI that ONLY returns valid JSON arrays. No explanations, no text.",
        },
        {
          role: "user",
          content: `Generate ${amount} interview questions.

Role: ${role}
Experience Level: ${level}
Tech Stack: ${techstack}
Focus: ${type}

Rules:
- Return ONLY a JSON array
- No explanations
- No text before or after
- No special characters like / or *
- Example format:
["Question 1", "Question 2"]`,
        },
      ],
      temperature: 0.7,
    });

    const rawText = completion.choices[0]?.message?.content || "";

    // 🧠 Safe parsing (VERY IMPORTANT)
    let parsedQuestions: string[] = [];

    try {
      parsedQuestions = JSON.parse(rawText);
    } catch {
      // fallback parsing if model messes up JSON
      parsedQuestions = rawText
        .replace(/[\[\]"]/g, "")
        .split("\n")
        .map((q) => q.trim())
        .filter((q) => q.length > 0);
    }

    // ⚠️ Final fallback (if still empty)
    if (!parsedQuestions.length) {
      parsedQuestions = [
        "Tell me about yourself",
        "What are your strengths?",
        "Explain a challenging project you worked on",
        "Why should we hire you?",
        "Where do you see yourself in 5 years?",
      ];
    }

    // 📦 Create interview object
    const interview = {
      role,
      type,
      level,
      techstack: techstack.split(",").map((t: string) => t.trim()),
      questions: parsedQuestions,
      userId: userid,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    // 💾 Save to Firestore
    await db.collection("interviews").add(interview);

    return Response.json(
      {
        success: true,
        questions: parsedQuestions, // useful for frontend debug
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error generating questions:", error);
    const message = error instanceof Error ? error.message : "Something went wrong";
    return Response.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return Response.json(
    { success: true, data: "API is working 🚀" },
    { status: 200 }
  );
}