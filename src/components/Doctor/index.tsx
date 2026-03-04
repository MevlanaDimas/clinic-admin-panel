'use client'

import { DoctorPracticeSchedule, Staff } from "@/app/generated/prisma/client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Separator } from "../ui/separator";
import Search from "../SearchBar";
import { PageSizeSelect } from "../PageSizeSelect";
import { CustomPagination } from "../CustomPagination";
import { DoctorScheduleForm } from "../Form/Doctor";
import { RoleGuard } from "../RoleGuard";
import { Check, X } from "lucide-react";


interface DoctorWithSchedule extends Staff {
    schedule?: DoctorPracticeSchedule[];
}

interface DoctorTableProps {
    data: DoctorWithSchedule[];
    query?: string;
    totalPages: number;
    currentPage: number;
    limit: string;
    totalCount: number;
}

const DoctorTable = ({ 
    data, 
    totalCount,
    query, 
    totalPages,
    limit,
    currentPage
}: DoctorTableProps) => {
    const [doctors, setDoctors] = useState(data);

    useEffect(() => {
        setDoctors(data);
    }, [data])

    const onScheduleUpdate = (doctorId: string, newSchedules: DoctorPracticeSchedule[]) => {
        setDoctors(prev => prev.map(doctor => 
            doctor.id === doctorId
                ? { ...doctor, schedule: newSchedules }
                : doctor
        ));
    }

    const removeDoctorFromList = (doctorId: string) => {
        setDoctors(prev => prev.filter(doctor => doctor.id !== doctorId));
    };
    
    const offset = (currentPage - 1) * (limit === "all" ? 0 : parseInt(limit, 10) || 10);

    const isAvailable = (status: boolean) => {
        if (status) {
            return <Check className="size-4 text-green-500 mx-auto" />;
        } else {
            return <X className="size-4 text-red-500 mx-auto" />;
        }
    };

    return (
        <AnimatePresence mode="wait">
            <div className="flex flex-col justify-center gap-10">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="flex flex-col gap-5"
                >
                    <div className="flex justify-between items-center px-2.5">
                        <h2 className="text-3xl font-bold tracking-tight">Doctor List</h2>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="w-70 pl-2">
                            <Search paramKey="query" placeholder="Search name or schedule..." />
                        </div>
                        <PageSizeSelect limit={limit} />
                    </div>

                    {query && (
                        <p className="text-sm text-muted-foreground">
                            Showing {doctors.length} results for <span className="font-semibold text-foreground">{query}</span>
                        </p>
                    )}
                <Separator />
                </motion.div>

                <motion.div 
                    key={query}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="p-4 rounded-md border bg-card shadow-sm"
                >
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="justify-center text-center items-center">No</TableHead>
                                <TableHead className="justify-center text-center items-center">Name</TableHead>
                                <TableHead className="justify-center text-center items-center">Schedule</TableHead>
                                <TableHead className="justify-center text-center items-center">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {doctors.length > 0 ? (
                                doctors.map((doctor: DoctorWithSchedule, index: number) => (
                                    <motion.tr
                                        layout
                                        key={doctor.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ delay: index * 0.05, type: "spring", stiffness: 500, damping: 30 }}
                                        whileHover={{ scale: 1.01, backgroundColor: "var(--accent)", transition: { duration: 0.2 } }}
                                        className="border-b transition-colors data-[state=selected]:bg-muted"
                                    >
                                        <TableCell className="text-center">{offset + index + 1}</TableCell>
                                        <TableCell className="text-center">{doctor.name}</TableCell>
                                        <TableCell className="flex flex-col gap-2 max-w-75 items-center">
                                            {doctor.schedule && doctor.schedule.length > 0 ? (
                                                doctor.schedule.map((schedule: DoctorPracticeSchedule) => (
                                                    <div key={schedule.id} className="flex flex-row justify-center items-center gap-3">
                                                        <p className="inline-flex items-center rounded-full px-3 py-1 bg-accent text-xs font-medium">{schedule.day} {schedule.startTime} - {schedule.endTime}</p>
                                                        {isAvailable(schedule.isAvailable)}
                                                    </div>
                                                ))
                                            ) : (
                                                <span>-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <RoleGuard
                                                allowedRole="Admin"
                                                fallback={<></>}
                                            >
                                                <DoctorScheduleForm
                                                    doctorName={doctor.name}
                                                    doctorId={doctor.id}
                                                    schedules={doctor.schedule} 
                                                    onScheduleDelete={removeDoctorFromList}
                                                    onScheduleUpdate={onScheduleUpdate}
                                                />
                                            </RoleGuard>
                                        </TableCell>
                                    </motion.tr>
                                ))
                            ) : (
                                <motion.tr
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        No users available.
                                    </TableCell>
                                </motion.tr>
                            )}
                        </TableBody>
                    </Table>
                </motion.div>
                
                <div className="flex flex-row sm:flex-col items-center justify-between gap-4 px-2 py-4">
                    {limit !== 'all' && totalPages > 1 && (
                        <CustomPagination 
                            totalPages={totalPages} 
                            currentPage={currentPage}
                        />
                    )}
                    <p className="text-sm text-muted-foreground">
                        Total {totalCount} items
                    </p>
                </div>
            </div>
        </AnimatePresence>
    )
}

export default DoctorTable;