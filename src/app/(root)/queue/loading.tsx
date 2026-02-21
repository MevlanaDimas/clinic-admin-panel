import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

export default function Loading() {
  return (
    <div className="flex flex-col gap-5 p-5 animate-in fade-in duration-500">
      {/* Header Section Skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-32 bg-muted/60" /> {/* "Queue" Title */}
        <Skeleton className="h-10 w-36 bg-muted/60" /> {/* "Call Next" Button */}
      </div>

      <div className="max-w-md">
        <Skeleton className="h-10 w-full rounded-md bg-muted/60" /> {/* Search Bar */}
      </div>

      <Separator className="mt-5" />

      {/* Table Section Skeleton */}
      <div className="rounded-md border bg-card/50 overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              {/* Columns: No, Token, Status, Counter, Created, Updated, Actions */}
              {Array.from({ length: 7 }).map((_, i) => (
                <TableHead key={i}>
                  <Skeleton className="h-4 w-full max-w-[100px]" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* 10 rows matching your default pagination limit */}
            {Array.from({ length: 10 }).map((_, rowIndex) => (
              <TableRow key={rowIndex} className="border-b">
                {Array.from({ length: 7 }).map((_, colIndex) => (
                  <TableCell key={colIndex}>
                    <Skeleton 
                      className="h-6 w-full opacity-70" 
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Footer Section Skeleton */}
      <div className="flex flex-row items-center justify-between gap-4 px-2 pt-4">
         <div className="flex gap-4 items-center">
            <Skeleton className="h-8 w-32" /> {/* Rows per page */}
            <Skeleton className="h-4 w-20" /> {/* Total count */}
         </div>
         <div className="flex gap-2">
            <Skeleton className="h-8 w-40" /> {/* Pagination */}
            <Skeleton className="h-10 w-32" /> {/* Add Queue Button */}
         </div>
      </div>
    </div>
  );
}