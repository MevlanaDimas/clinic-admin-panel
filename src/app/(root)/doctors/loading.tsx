import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

export default function Loading() {
  return (
    <div className="flex flex-col justify-center gap-10 p-5 animate-in fade-in duration-500">
      {/* Header Section Skeleton */}
      <div className="flex flex-col gap-5">
        <div className="flex justify-between items-center px-2.5">
          <Skeleton className="h-10 w-48 bg-muted/60" /> {/* "Doctor List" Title */}
          <Skeleton className="h-10 w-32 bg-muted/60" /> {/* UserForm Button */}
        </div>

        <div className="flex items-center justify-between">
          <div className="w-70 pl-2">
            <Skeleton className="h-10 w-full rounded-md bg-muted/60" /> {/* Search Bar */}
          </div>
          <Skeleton className="h-10 w-24 bg-muted/60" /> {/* PageSizeSelect */}
        </div>
        
        <Separator />
      </div>

      {/* Table Section Skeleton */}
      <div className="p-4 rounded-md border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {/* Columns: No, Name, Schedule, Action */}
              <TableHead className="w-20"><Skeleton className="h-4 w-10 mx-auto" /></TableHead>
              <TableHead><Skeleton className="h-4 w-32 mx-auto" /></TableHead>
              <TableHead><Skeleton className="h-4 w-40 mx-auto" /></TableHead>
              <TableHead><Skeleton className="h-4 w-20 mx-auto" /></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Rows matching your limit */}
            {Array.from({ length: 8 }).map((_, rowIndex) => (
              <TableRow key={rowIndex} className="border-b">
                {/* No */}
                <TableCell className="text-center">
                  <Skeleton className="h-6 w-8 mx-auto opacity-70" />
                </TableCell>
                {/* Name */}
                <TableCell>
                  <Skeleton className="h-6 w-48 mx-auto opacity-70" />
                </TableCell>
                {/* Schedule (Multiple Pill-shaped Skeletons) */}
                <TableCell className="flex flex-col items-center gap-2">
                  <Skeleton className="h-6 w-40 rounded-full opacity-60" />
                  <Skeleton className="h-6 w-36 rounded-full opacity-40" />
                </TableCell>
                {/* Action */}
                <TableCell>
                  <Skeleton className="h-9 w-24 mx-auto rounded-md opacity-70" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Footer Section Skeleton */}
      <div className="flex flex-row items-center justify-between gap-4 px-2 py-4">
         <Skeleton className="h-10 w-64" /> {/* Pagination buttons */}
         <Skeleton className="h-4 w-32" /> {/* Total count text */}
      </div>
    </div>
  );
}