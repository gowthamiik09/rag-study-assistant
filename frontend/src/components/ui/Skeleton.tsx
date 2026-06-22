"use client";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-lg bg-white/[0.06] ${className}`}
    />
  );
}

export function ChatSkeleton() {
  return (
    <div
      className="flex flex-col gap-4 p-4"
      role="status"
      aria-label="Loading chat messages"
    >
      {/* Simulated user message */}
      <div className="flex flex-row-reverse items-start gap-3">
        <Skeleton className="w-7 h-7 rounded-[9px] flex-shrink-0" />
        <div className="flex flex-col gap-1.5 items-end max-w-[78%]">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-10 w-56 rounded-xl" />
        </div>
      </div>

      {/* Simulated assistant message */}
      <div className="flex flex-row items-start gap-3">
        <Skeleton className="w-7 h-7 rounded-[9px] flex-shrink-0" />
        <div className="flex flex-col gap-1.5 items-start max-w-[78%]">
          <Skeleton className="h-3 w-28" />
          <div className="flex flex-col gap-2 w-full">
            <Skeleton className="h-4 w-72 rounded-xl" />
            <Skeleton className="h-4 w-64 rounded-xl" />
            <Skeleton className="h-4 w-48 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Another simulated user message */}
      <div className="flex flex-row-reverse items-start gap-3">
        <Skeleton className="w-7 h-7 rounded-[9px] flex-shrink-0" />
        <div className="flex flex-col gap-1.5 items-end max-w-[78%]">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-10 w-40 rounded-xl" />
        </div>
      </div>

      {/* Simulated assistant message */}
      <div className="flex flex-row items-start gap-3">
        <Skeleton className="w-7 h-7 rounded-[9px] flex-shrink-0" />
        <div className="flex flex-col gap-1.5 items-start max-w-[78%]">
          <Skeleton className="h-3 w-24" />
          <div className="flex flex-col gap-2 w-full">
            <Skeleton className="h-4 w-80 rounded-xl" />
            <Skeleton className="h-4 w-60 rounded-xl" />
          </div>
        </div>
      </div>

      <span className="sr-only">Loading...</span>
    </div>
  );
}
