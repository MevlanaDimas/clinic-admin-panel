import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

export default function Loading() {
  return (
    <div className="flex flex-col gap-5 p-5 animate-in fade-in duration-500">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-4 w-full">
          <Skeleton className="h-10 w-48 bg-muted/60" />
          <div className="max-w-md">
            <Skeleton className="h-10 w-full rounded-md bg-muted/60" />
          </div>
        </div>
        <Skeleton className="h-10 w-32 bg-muted/60" />
      </div>

      <Separator />

      {/* Table Skeleton */}
      <div className="rounded-md border bg-card/50 overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/20">
            <TableRow>
              {Array.from({ length: 9 }).map((_, i) => (
                <TableHead key={i}><Skeleton className="h-4 w-24" /></TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 8 }).map((_, rowIndex) => (
              <TableRow key={rowIndex} className="border-b">
                {Array.from({ length: 9 }).map((_, colIndex) => (
                  <TableCell key={colIndex}>
                    <Skeleton className="h-6 w-full opacity-70" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Footer Skeleton */}
      <div className="flex items-center justify-between px-2 pt-4">
         <div className="flex gap-4 items-center">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-20" />
         </div>
         <Skeleton className="h-8 w-64" />
      </div>
    </div>
  );
}