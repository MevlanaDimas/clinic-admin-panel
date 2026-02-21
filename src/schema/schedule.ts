import * as z from "zod";


export const DAYS_OF_WEEK = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
] as const;

const singleScheduleSchema = z.object({
    day: z.enum(DAYS_OF_WEEK, {
        error: (issue) => issue.received === "undefined" ? "Select a day" : "Invalid day"
    }),
    startTime: z.string({ error: "Start time is required" }),
    endTime: z.string({ error: "End time is required" }),
    isAvailable: z.boolean(),
}).refine((data) => {
    // Basic comparison for HH:mm strings
    return data.endTime > data.startTime;
}, {
    message: "End time must be after start time",
    path: ["endTime"],
});

export const doctorScheduleSchema = z.object({
    schedules: z.array(singleScheduleSchema).min(1, "Add at least one slot"),
});

export type DoctorScheduleValues = z.infer<typeof doctorScheduleSchema>;