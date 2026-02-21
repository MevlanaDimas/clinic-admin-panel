'use client'

import { RoleRequest, Staff } from "@/app/generated/prisma/client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { useEffect, useState } from "react";
import { pusherClient } from "@/lib/pusher";
import { AnimatePresence, motion } from "framer-motion";
import { UserRequestedTitleChangeApprovalForm } from "../UserChangeTitle";
import { UserForm } from "../Form/User";
import { Separator } from "../ui/separator";
import Search from "../SearchBar";
import { PageSizeSelect } from "../PageSizeSelect";
import { CustomPagination } from "../CustomPagination";


interface UserTableProps {
    data: Staff[];
    totalCount: number;
    requestData: (RoleRequest & { staff?: Staff})[]; // Data for the Title Change table
    totalRequestCount: number;
    searchParams: {
        page?: string;
        limit?: string;
        query?: string;
        reqPage?: string;
        reqLimit?: string;
        reqQuery?: string;
        [key: string]: string | string[] | undefined;
    };
}

const UserTable = ({ 
    data, 
    totalCount, 
    requestData, 
    totalRequestCount, 
    searchParams 
}: UserTableProps) => {
    const [requests, setRequests] = useState(requestData);
    const [users, setUsers] = useState(data);

    useEffect(() => {
        const channel = pusherClient.subscribe('private-admin-notifications');
        
        channel.bind('role-update-request', (data: RoleRequest & { staffName: string}) => {
            const newRequest = {
                ...data,
                staff: { name: data.staffName } as Staff
            };

            setRequests((prev) => [newRequest, ...prev]);
        });

        channel.bind('request-resolved', ({ id }: { id: string }) => {
            setRequests((prev) => prev.filter((req) => req.id !== id));
        });

        return () => {
            channel.unbind_all();
            pusherClient.unsubscribe('private-admin-notifications')
        };
    }, []);

    const onOptimisticDeleteUser = (id: string) => {
        setUsers(prev => prev.filter(u => u.id !== id));
    };

    const onOptimisticRequestUpdate = (id: string) => {
        setRequests(prev => prev.filter(r => r.id !== id));
    };

    // Calculate total pages based on current limits
    const userLimit = Number(searchParams.limit) || 10;
    const userTotalPages = Math.ceil(totalCount / userLimit);

    const reqLimit = Number(searchParams.reqLimit) || 10;
    const reqTotalPages = Math.ceil(totalRequestCount / reqLimit);

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
                        <h2 className="text-3xl font-bold tracking-tight">Users List</h2>
                        <UserForm />
                    </div>
                    <div className="flex items-center justify-between px-2.5">
                        <div className="w-72">
                            <Search paramKey="query" placeholder="Search name, email, or role..." />
                        </div>
                        <PageSizeSelect limit={searchParams.limit || "10"} paramKey="limit" />
                    </div>
                </motion.div>
                <Separator />

                <div className="px-2.5">
                    <motion.div 
                        key={JSON.stringify(searchParams)}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="p-4 rounded-md border bg-card shadow-sm"
                    >
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12.5">No</TableHead>
                                    <TableHead className="w-12.5">Name</TableHead>
                                    <TableHead className="w-12.5">Role</TableHead>
                                    <TableHead className="max-w-75">Bio</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.length > 0 ? (
                                    users.map((user: Staff, index: number) => (
                                        <motion.tr
                                            layout
                                            key={user.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ delay: index * 0.05, type: "spring", stiffness: 500, damping: 30 }}
                                            whileHover={{ scale: 1.01, backgroundColor: "var(--accent)", transition: { duration: 0.2 } }}
                                            className="border-b transition-colors data-[state=selected]:bg-muted"
                                        >
                                            <TableCell className="text-center">{index + 1}</TableCell>
                                            <TableCell className="text-center">{user.name}</TableCell>
                                            <TableCell className="text-center">
                                                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-accent">
                                                    {user.title}
                                                </span>
                                            </TableCell>
                                            <TableCell className="truncate max-w-75 text-center">
                                                {user.bio || "-"}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <UserForm initialData={user} onOptimisticDelete={onOptimisticDeleteUser} />
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
                        <CustomPagination 
                            totalPages={userTotalPages} 
                            currentPage={Number(searchParams.page) || 1} 
                            paramKey="page" 
                        />
                        <p className="text-sm text-muted-foreground">
                            Total {totalCount} items
                        </p>
                    </div>
                </div>
                
                <Separator />
                
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="flex flex-col gap-5 mt-10"
                >
                    <div className="flex flex-row justify-between items-center">
                        <div className="flex items-center gap-4">
                            <h2 className="text-3xl font-bold tracking-tight">Title Change Approvals</h2>
                            {requests.length > 0 && (
                                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full animate-pulse">
                                    {requests.length} PENDING
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center justify-between px-2.5">
                        <div className="w-72">
                            <Search paramKey="reqQuery" placeholder="Search staff name..." />
                        </div>
                        <PageSizeSelect limit={searchParams.reqLimit || "10"} paramKey="reqLimit" />
                    </div>
                    <Separator />
                </motion.div>
                <div className="px-2.5">
                    <motion.div
                        key={JSON.stringify(searchParams)}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="p-4 rounded-md border bg-card shadow-sm"
                    >
                        <Table>
                            <TableHeader className="text-center">
                                <TableRow>
                                    <TableHead className="text-center">No</TableHead>
                                    <TableHead className="text-center">Staff Member</TableHead>
                                    <TableHead className="text-center">Requested Role</TableHead>
                                    <TableHead className="text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {requests.length > 0 ? (
                                    requests.map((request, index: number) => (
                                        <motion.tr
                                            layout
                                            key={request.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ delay: index * 0.05, type: "spring", stiffness: 500, damping: 30 }}
                                            whileHover={{ scale: 1.01, backgroundColor: "var(--accent)", transition: { duration: 0.2 } }} 
                                            className="border-b transition-colors data-[state=selected]:bg-muted"
                                        >
                                            <TableCell className="text-center">{index + 1}</TableCell>
                                            <TableCell className="text-center">{request.staff?.name}</TableCell>
                                            <TableCell className="text-center">{request.requestedRole}</TableCell>
                                            <TableCell className="text-center">
                                                <UserRequestedTitleChangeApprovalForm initialData={request} onOptimisticUpdate={onOptimisticRequestUpdate} />
                                            </TableCell>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <motion.tr
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            No request available.
                                        </TableCell>
                                    </motion.tr>
                                )}
                            </TableBody>
                        </Table>
                    </motion.div>

                    <div className="flex flex-row sm:flex-col items-center justify-between gap-4 px-2 py-4">
                        <CustomPagination 
                            totalPages={reqTotalPages} 
                            currentPage={Number(searchParams.reqPage) || 1} 
                            paramKey="reqPage" 
                        />
                        <p className="text-sm text-muted-foreground">
                            Total {totalRequestCount} requests
                        </p>
                    </div>
                </div>
            </div>
        </AnimatePresence>
    )
}

export default UserTable;