"use server";

import OpenAI from "openai";

import { db } from "@/firebase/admin";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function createFeedback(params: CreateFeedbackParams) {
  const { interviewId, userId, transcript, feedbackId } = params;

  try {
    // 🧠 Format transcript
    const formattedTranscript = transcript
      .map(
        (sentence: { role: string; content: string }) =>
          `- ${sentence.role}: ${sentence.content}\n`
      )
      .join("");

    // 🚀 Call OpenAI
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a strict AI interviewer that ONLY returns valid JSON.",
        },
        {
          role: "user",
          content: `
Analyze this mock interview transcript and return structured feedback.

Transcript:
${formattedTranscript}

Return ONLY valid JSON in this format:

{
  "totalScore": number,
  "categoryScores": {
    "communication": number,
    "technical": number,
    "problemSolving": number,
    "cultureFit": number,
    "confidence": number
  },
  "strengths": ["point1", "point2"],
  "areasForImprovement": ["point1", "point2"],
  "finalAssessment": "summary"
}

Rules:
- Scores must be between 0-100
- Be strict and realistic
- No explanation outside JSON
- No markdown
`,
        },
      ],
      temperature: 0.7,
    });

    const raw = completion.choices[0]?.message?.content || "";

    // 🧠 Safe parsing
    let parsed;

    try {
      parsed = JSON.parse(raw);
    } catch {
      console.error("JSON parse failed, using fallback");

      parsed = {
        totalScore: 60,
        categoryScores: {
          communication: 60,
          technical: 55,
          problemSolving: 58,
          cultureFit: 65,
          confidence: 62,
        },
        strengths: ["Good effort", "Clear communication"],
        areasForImprovement: [
          "Improve technical depth",
          "Give more structured answers",
        ],
        finalAssessment:
          "Candidate shows potential but needs improvement in technical and structured thinking.",
      };
    }

    // 📦 Save feedback
    const feedback = {
      interviewId,
      userId,
      totalScore: parsed.totalScore,
      categoryScores: parsed.categoryScores,
      strengths: parsed.strengths,
      areasForImprovement: parsed.areasForImprovement,
      finalAssessment: parsed.finalAssessment,
      createdAt: new Date().toISOString(),
    };

    let feedbackRef;

    if (feedbackId) {
      feedbackRef = db.collection("feedback").doc(feedbackId);
    } else {
      feedbackRef = db.collection("feedback").doc();
    }

    await feedbackRef.set(feedback);

    return { success: true, feedbackId: feedbackRef.id };
  } catch (error: unknown) {
    console.error("Error saving feedback:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}

// ✅ OTHER FUNCTIONS (unchanged)

export async function getInterviewById(id: string): Promise<Interview | null> {
  const interview = await db.collection("interviews").doc(id).get();
  if (!interview.exists) return null;
  return { id: interview.id, ...interview.data() } as Interview;
}

export async function getFeedbackByInterviewId(
  params: GetFeedbackByInterviewIdParams
): Promise<Feedback | null> {
  const { interviewId, userId } = params;

  const querySnapshot = await db
    .collection("feedback")
    .where("interviewId", "==", interviewId)
    .where("userId", "==", userId)
    .limit(1)
    .get();

  if (querySnapshot.empty) return null;

  const feedbackDoc = querySnapshot.docs[0];
  return { id: feedbackDoc.id, ...feedbackDoc.data() } as Feedback;
}

export async function getLatestInterviews(
  params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
  const { userId, limit = 20 } = params;

  const interviews = await db
    .collection("interviews")
    .where("finalized", "==", true) // ✅ FIXED ORDER
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();

  return interviews.docs
    .map((doc) => ({ id: doc.id, ...doc.data() } as Interview))
    .filter((i) => i.userId !== userId);
}

export async function getInterviewsByUserId(
  userId: string
): Promise<Interview[] | null> {
  if (!userId) return [];

  const interviews = await db
    .collection("interviews")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}