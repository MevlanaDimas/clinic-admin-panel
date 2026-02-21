import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function Loading() {
  return (
    <div className="flex-col animate-in fade-in duration-500">
      <div className="flex-1 space-y-4">
        {/* Header Section */}
        <div className="flex items-center justify-between px-2">
          <div className="space-y-1">
            <Skeleton className="h-9 w-64" /> {/* Title: Create/Edit News */}
            <Skeleton className="h-4 w-48" /> {/* Subtitle description */}
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-24 rounded-md" /> {/* Back Button */}
          </div>
        </div>

        <Separator />

        <div className="w-full p-5 space-y-8">
          {/* Title Field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" /> {/* Label */}
            <Skeleton className="h-10 w-full rounded-md" /> {/* Input */}
          </div>

          {/* AI Toggle Section */}
          <div className="flex items-center space-x-2">
            <Skeleton className="h-6 w-10 rounded-full" /> {/* Switch */}
            <Skeleton className="h-4 w-48" /> {/* Label */}
          </div>

          {/* Content Textarea (matches min-h-25) */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-25 w-full rounded-md" /> 
          </div>

          {/* Images Section (Single Slot) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-8 w-24 rounded-md" /> {/* Add Image Button */}
            </div>
            <div className="flex flex-row gap-3 items-start border p-3 rounded-md">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-32 w-full rounded-md" /> {/* ImageDropzone */}
                <Skeleton className="h-8 w-full rounded-md" /> {/* Read-only Name Input */}
              </div>
              <Skeleton className="h-10 w-10 shrink-0 rounded-md" /> {/* Trash Button */}
            </div>
          </div>

          {/* Author & Category Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          </div>

          {/* Summary Section (matches min-h-25 + AI Button) */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-9 w-32 rounded-md" /> {/* AI Generate Button */}
            </div>
            <Skeleton className="h-25 w-full rounded-md" />
          </div>

          {/* Metadata Grid (Tags, Source, Audience, Evidence) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-12" /> {/* Tags */}
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <div className="space-y-2 border p-3 rounded-md">
              <Skeleton className="h-4 w-24 mb-2" /> {/* Source Links Label */}
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" /> {/* Target Audience */}
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" /> {/* Evidence Level */}
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-row mt-18 items-center justify-between">
            <Skeleton className="h-10 w-32 rounded-md" /> {/* AlertModal (Delete) */}
            <Skeleton className="h-10 w-28 rounded-md" /> {/* Action Button (Create/Save) */}
          </div>
        </div>
      </div>
    </div>
  );
}