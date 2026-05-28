"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Phone, PhoneOff, Mic, User, Loader2, MessageSquare } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";

import { createFeedback } from "@/lib/actions/general.action";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

const Agent = ({
  userName,
  userId,
  interviewId,
  feedbackId,
  type,
  questions,
}: AgentProps) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState<string>("");

  useEffect(() => {
    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE);
    };

    const onCallEnd = () => {
      setCallStatus(CallStatus.FINISHED);
    };

    const onMessage = (message: Message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    const onSpeechStart = () => {
      console.log("speech start");
      setIsSpeaking(true);
    };

    const onSpeechEnd = () => {
      console.log("speech end");
      setIsSpeaking(false);
    };

    const onError = (error: any) => {
      console.error("Vapi Error:", error);
      setCallStatus(CallStatus.INACTIVE);
      try {
        vapi.stop();
      } catch (e) {
        console.error("Error stopping Vapi:", e);
      }

      let errMsg = "";
      let errStr = "";

      if (typeof error === "string") {
        errMsg = error;
        errStr = error;
      } else if (error && typeof error === "object") {
        const rawErrMsg = error.message || error.errorMsg || error.error || "";
        errMsg = typeof rawErrMsg === "string" ? rawErrMsg : JSON.stringify(rawErrMsg);
        try {
          errStr = JSON.stringify(error);
        } catch (e) {
          errStr = String(error);
        }
      } else {
        errMsg = String(error || "");
        errStr = errMsg;
      }

      const lowerErrMsg = errMsg.toLowerCase();
      const lowerErrStr = errStr.toLowerCase();

      if (
        lowerErrMsg.includes("permission") ||
        lowerErrMsg.includes("notallowed") ||
        lowerErrStr.includes("permission") ||
        lowerErrStr.includes("notallowed")
      ) {
        toast.error("Microphone access denied. Please enable microphone permission in your browser and try again.");
      } else {
        toast.error("Could not connect to the AI interviewer. Please check your microphone and internet connection.");
      }
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }

    const handleGenerateFeedback = async (messages: SavedMessage[]) => {
      console.log("handleGenerateFeedback");

      const { success, feedbackId: id } = await createFeedback({
        interviewId: interviewId!,
        userId: userId!,
        transcript: messages,
        feedbackId,
      });

      if (success && id) {
        router.push(`/interview/${interviewId}/feedback`);
      } else {
        console.log("Error saving feedback");
        router.push("/");
      }
    };

    if (callStatus === CallStatus.FINISHED) {
      if (type === "generate") {
        router.push("/");
      } else {
        handleGenerateFeedback(messages);
      }
    }
  }, [messages, callStatus, feedbackId, interviewId, router, type, userId]);

  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);

    if (type === "generate") {
      await vapi.start(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID!, {
        variableValues: {
          username: userName,
          userid: userId,
        },
      });
    } else {
      const formattedQuestions = questions
        ? questions.map((q) => `- ${q}`).join("\n")
        : "";

      await vapi.start(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID!, {
        variableValues: {
          questions: formattedQuestions,
          username: userName,
        },
      });
    }
  };

  const handleDisconnect = () => {
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto items-center mt-6">
      
      {/* Side-by-Side Call Panel */}
      <div className="call-view w-full">
        
        {/* AI Interviewer Panel */}
        <div className="relative group rounded-2xl border border-white/5 bg-[#0D0E12]/80 backdrop-blur-xl p-[1px] hover:border-white/10 transition-all duration-500 hover:shadow-[0_0_40px_-10px_rgba(167,139,250,0.15)] flex-1 w-full">
          <div className="flex flex-col items-center justify-center p-8 h-[360px] bg-[#090a0f]/60 rounded-2xl relative overflow-hidden">
            
            {/* Dynamic Background Pulsing Radial when speaking */}
            {isSpeaking && (
              <div className="absolute inset-0 bg-primary-200/5 blur-3xl rounded-full scale-75 animate-pulse" />
            )}

            {/* Avatar block with ripples */}
            <div className="z-10 flex items-center justify-center bg-gradient-to-tr from-primary-200/10 to-violet-500/10 border border-white/10 rounded-full size-[120px] relative">
              <Image
                src="/ai-avatar.png"
                alt="AI Interviewer"
                width={70}
                height={60}
                className="object-cover relative z-10"
              />
              
              {/* Concentric Speaking Sonar Ripple Rings */}
              {isSpeaking && (
                <>
                  <span className="absolute inset-0 rounded-full bg-primary-200/20 border border-primary-200/30 animate-speak" />
                  <span className="absolute -inset-4 rounded-full bg-primary-200/10 border border-primary-200/20 animate-speak [animation-delay:0.5s]" />
                  <span className="absolute -inset-8 rounded-full bg-primary-200/5 border border-primary-200/10 animate-speak [animation-delay:1s]" />
                </>
              )}
            </div>

            <h3 className="mt-6 text-base font-bold tracking-tight text-white/90">AI Interviewer</h3>
            
            {/* Animated Waveform Visualizer */}
            {isSpeaking ? (
              <div className="flex items-end justify-center gap-1 h-6 mt-4">
                <div className="w-1 bg-primary-200 rounded-full animate-wave-1 h-5" />
                <div className="w-1 bg-primary-200 rounded-full animate-wave-2 h-3" />
                <div className="w-1 bg-primary-200 rounded-full animate-wave-3 h-6" />
                <div className="w-1 bg-primary-200 rounded-full animate-wave-4 h-4" />
                <div className="w-1 bg-primary-200 rounded-full animate-wave-5 h-5" />
              </div>
            ) : (
              <div className="flex items-end justify-center gap-1 h-6 mt-4 opacity-30">
                <div className="w-1 bg-white/20 rounded-full h-1.5" />
                <div className="w-1 bg-white/20 rounded-full h-1.5" />
                <div className="w-1 bg-white/20 rounded-full h-1.5" />
                <div className="w-1 bg-white/20 rounded-full h-1.5" />
                <div className="w-1 bg-white/20 rounded-full h-1.5" />
              </div>
            )}

          </div>
        </div>

        {/* User Profile Panel */}
        <div className="relative group rounded-2xl border border-white/5 bg-[#0D0E12]/80 backdrop-blur-xl p-[1px] hover:border-white/10 transition-all duration-500 hover:shadow-[0_0_40px_-10px_rgba(167,139,250,0.15)] flex-1 w-full">
          <div className="flex flex-col items-center justify-center p-8 h-[360px] bg-[#090a0f]/60 rounded-2xl">
            <div className="relative p-[3px] rounded-full bg-gradient-to-tr from-white/5 to-white/10 group-hover:from-primary-200/20 group-hover:to-violet-500/20 transition-all duration-500">
              <Image
                src="/user-avatar.png"
                alt="user-avatar"
                width={120}
                height={120}
                className="rounded-full object-cover size-[120px]"
              />
            </div>
            <h3 className="mt-6 text-base font-bold tracking-tight text-white/90">{userName}</h3>
            
            <div className="flex items-center gap-1.5 text-xs text-light-400 font-semibold mt-4">
              <Mic className="size-3.5 text-primary-200" />
              <span>Your Microphone is Active</span>
            </div>
          </div>
        </div>

      </div>

      {/* Dialogue Live Transcription Bubble */}
      {messages.length > 0 && (
        <div className="transcript-border w-full max-w-2xl">
          <div className="transcript flex gap-3.5 items-start">
            <div className="p-2 rounded-lg bg-primary-200/10 border border-primary-200/20 text-primary-200 mt-0.5">
              <MessageSquare className="size-4" />
            </div>
            <p
              key={lastMessage}
              className={cn(
                "transition-all duration-500 opacity-0 text-left",
                "animate-fadeIn opacity-100"
              )}
            >
              {lastMessage}
            </p>
          </div>
        </div>
      )}

      {/* Calling Actions Control Panel */}
      <div className="w-full flex justify-center mt-4">
        {callStatus !== CallStatus.ACTIVE ? (
          <button 
            className="group relative flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-97 transition-all duration-300 rounded-full shadow-[0_4px_25px_-5px_rgba(16,185,129,0.4)] hover:shadow-[0_8px_30px_rgba(16,185,129,0.6)] cursor-pointer min-w-[160px]"
            onClick={handleCall}
            disabled={callStatus === CallStatus.CONNECTING}
          >
            {callStatus === CallStatus.CONNECTING ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <Phone className="size-4 text-emerald-200 group-hover:scale-110 transition-transform duration-300" />
                <span>Start Session</span>
              </>
            )}
          </button>
        ) : (
          <button 
            className="group relative flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-bold text-white bg-destructive-100 hover:bg-destructive-200 active:scale-97 transition-all duration-300 rounded-full shadow-[0_4px_25px_-5px_rgba(239,68,68,0.4)] hover:shadow-[0_8px_30px_rgba(239,68,68,0.6)] cursor-pointer min-w-[160px]"
            onClick={handleDisconnect}
          >
            <PhoneOff className="size-4 text-red-200 group-hover:scale-110 transition-transform duration-300" />
            <span>End Session</span>
          </button>
        )}
      </div>

    </div>
  );
};

export default Agent;
