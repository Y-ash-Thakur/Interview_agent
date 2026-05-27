import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Star, ArrowRight } from "lucide-react";

import { Button } from "./ui/button";
import DisplayTechIcons from "./DisplayTechIcons";

import { cn, getRandomInterviewCover } from "@/lib/utils";
import { getFeedbackByInterviewId } from "@/lib/actions/general.action";

const InterviewCard = async ({
  interviewId,
  userId,
  role,
  type,
  techstack,
  createdAt,
}: InterviewCardProps) => {
  const feedback =
    userId && interviewId
      ? await getFeedbackByInterviewId({
          interviewId,
          userId,
        })
      : null;

  const normalizedType = /mix/gi.test(type) ? "Mixed" : type;

  // Modern pill styles for different interview categories
  const badgeClasses =
    {
      Behavioral: "border-sky-500/20 text-sky-400 bg-sky-500/5",
      Mixed: "border-purple-500/20 text-purple-400 bg-purple-500/5",
      Technical: "border-indigo-500/20 text-indigo-400 bg-indigo-500/5",
    }[normalizedType] || "border-white/10 text-light-100 bg-white/5";

  const formattedDate = dayjs(
    feedback?.createdAt || createdAt || Date.now()
  ).format("MMM D, YYYY");

  const hasScore = typeof feedback?.totalScore === "number";

  return (
    <div className="group relative rounded-2xl border border-white/5 bg-[#0D0E12]/80 backdrop-blur-xl p-[1px] hover:border-white/10 transition-all duration-500 hover:shadow-[0_0_30px_-5px_rgba(167,139,250,0.12)] w-[360px] max-sm:w-full min-h-[380px] flex flex-col justify-between overflow-hidden">
      {/* Subtle Glow Layer on Hover */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary-200/0 via-primary-200/0 to-primary-200/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Card Content wrapper */}
      <div className="relative z-10 flex flex-col flex-1 p-6 justify-between h-full">
        <div>
          {/* Card Header: Cover Image & Type Pill */}
          <div className="flex items-start justify-between">
            <div className="relative p-[3px] rounded-2xl bg-gradient-to-tr from-white/5 to-white/10 group-hover:from-primary-200/20 group-hover:to-violet-500/20 transition-all duration-500">
              <Image
                src={getRandomInterviewCover()}
                alt="cover-image"
                width={72}
                height={72}
                className="rounded-xl object-cover size-18 group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            <span className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md", badgeClasses)}>
              {normalizedType}
            </span>
          </div>

          {/* Title */}
          <h3 className="mt-5 text-lg font-bold tracking-tight text-white capitalize group-hover:text-primary-200 transition-colors duration-300">
            {role} Interview
          </h3>

          {/* Metadata: Date & Score */}
          <div className="flex flex-wrap items-center gap-2.5 mt-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/5 text-xs text-light-100 font-medium">
              <Calendar className="size-3.5 text-primary-200" />
              <span>{formattedDate}</span>
            </div>

            <div className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold",
              hasScore 
                ? "bg-amber-500/5 border-amber-500/20 text-amber-400"
                : "bg-white/[0.03] border-white/5 text-light-100"
            )}>
              <Star className={cn("size-3.5", hasScore ? "fill-amber-400 text-amber-400" : "text-light-400")} />
              <span>{hasScore ? `${feedback.totalScore}/100` : "Not Taken"}</span>
            </div>
          </div>

          {/* Description / Summary */}
          <p className="text-xs text-light-400 mt-4 line-clamp-3 leading-relaxed">
            {feedback?.finalAssessment ||
              "You haven't taken this interview yet. Click below to begin your personalized practice session."}
          </p>
        </div>

        {/* Card Footer: Tech Stack & Action Button */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/[0.06]">
          <DisplayTechIcons techStack={techstack} />

          <Button asChild className="group/btn bg-primary-200 text-dark-100 hover:bg-white hover:text-dark-100 transition-all duration-300 rounded-full font-bold px-4 py-2 text-xs flex items-center gap-1.5 cursor-pointer shadow-[0_4px_15px_-3px_rgba(167,139,250,0.3)]">
            <Link
              href={
                feedback
                  ? `/interview/${interviewId}/feedback`
                  : `/interview/${interviewId}`
              }
            >
              <span>{feedback ? "Feedback" : "Start"}</span>
              <ArrowRight className="size-3 group-hover/btn:translate-x-1 transition-transform duration-300" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InterviewCard;
