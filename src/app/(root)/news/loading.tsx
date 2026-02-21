import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

export default function Loading() {
  return (
    <div className="flex flex-col gap-10 p-5 animate-in fade-in duration-500">
      {/* Header Section Skeleton */}
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-32 bg-muted/60" /> {/* "News" Title */}
          <Skeleton className="h-10 w-32 bg-muted/60" /> {/* "Add News" Button */}
        </div>

        <div className="flex items-center justify-between">
          <div className="w-70 pl-2">
            <Skeleton className="h-10 w-full rounded-md bg-muted/60" /> {/* Search Bar */}
          </div>
          <Skeleton className="h-10 w-20 bg-muted/60" /> {/* PageSizeSelect */}
        </div>
        
        <Separator className="mt-5" />
      </div>

      {/* Table Section Skeleton */}
      <div className="rounded-md border bg-card/50 overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              {/* No, Title, Category, Author, Status, Modified, Actions */}
              {Array.from({ length: 7 }).map((_, i) => (
                <TableHead key={i}>
                  <Skeleton className="h-4 w-full max-w-[100px]" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Generating 10 rows to match your default limit */}
            {Array.from({ length: 10 }).map((_, rowIndex) => (
              <TableRow key={rowIndex} className="border-b">
                {Array.from({ length: 7 }).map((_, colIndex) => (
                  <TableCell key={colIndex}>
                    <Skeleton 
                      className={`h-6 w-full ${colIndex === 1 ? 'max-w-[250px]' : 'max-w-[100px]'} opacity-70`} 
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Footer Section Skeleton */}
      <div className="flex flex-row items-center justify-between gap-4 px-2">
         <Skeleton className="h-8 w-64" /> {/* Pagination buttons */}
         <Skeleton className="h-4 w-32" /> {/* Total count text */}
      </div>
    </div>
  );
}