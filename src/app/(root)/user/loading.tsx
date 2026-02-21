import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function Loading() {
  return (
    <div className="flex flex-col gap-8 p-5 animate-in fade-in duration-500">
      {/* User List Section */}
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48 bg-muted/60" />
        <Skeleton className="h-10 w-full max-w-md bg-muted/60" />
        <div className="rounded-md border bg-card/50 overflow-hidden mt-4">
           {/* Skeleton Table Rows (x5) */}
           {Array.from({ length: 6 }).map((_, i) => (
             <div key={i} className="p-4 border-b flex gap-4"><Skeleton className="h-6 w-full" /></div>
           ))}
        </div>
      </div>

      <Separator />

      {/* Role Requests Section */}
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64 bg-muted/60" />
        <div className="rounded-md border bg-card/50 overflow-hidden mt-4">
           {Array.from({ length: 3 }).map((_, i) => (
             <div key={i} className="p-4 border-b flex gap-4"><Skeleton className="h-6 w-full" /></div>
           ))}
        </div>
      </div>
    </div>
  );
}