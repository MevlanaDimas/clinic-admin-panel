import * as z from "zod";


export const userFormSchema = z.object({
    firstName: z.string({
        error: (issue) => issue.input === undefined ? "First name is required" : "First name must be a string"
    })
    .min(1, "First name must be at least 1 character long"),
    lastName: z.string({
        error: (issue) => issue.input === undefined ? "Last name is required" : "Last name must be a string"
    })
    .min(1, "Last name must be at least 1 character long"),
    title: z.enum(["Doctor", "Staff", "Admin"], {
        error: (issue) => {
            if (issue.code === "invalid_value" && issue.received === "undefined") {
                return "Title is required";
            }
            return "Please select a valid role (Doctor, Staff, Admin)";
        }
    }),
    bio: z.string({ error: "Bio must be a string" })
    .max(160, "Bio must be at most 160 characters long")
    .optional().nullable(),
    email: z.email("Invalid email address").toLowerCase().trim(),
    username: z.string({
        error: (issue) => issue.input === undefined ? "Username is required" : "Username must be a string"
    })
    .min(4, "Username must be at least 4 characters long")
    .max(64, "Username must be at most 64 characters long"),
    password: z
        .string({ error: "Password is required" })
        .min(8, { error: "Password must be at least 8 characters long" })
        .regex(/[A-Z]/, { error: "Password must contain at least one uppercase letter" })
        .regex(/[0-9]/, { error: "Password must contain at least one number" }),
    confirmPassword: z
        .string({ error: "Confirm password is required" })
        .min(8, { error: "Password must be at least 8 characters long" })
        .regex(/[A-Z]/, { error: "Password must contain at least one uppercase letter" })
        .regex(/[0-9]/, { error: "Password must contain at least one number" })
}).refine((data) => data.password === data.confirmPassword, {
    error: "Passwords don't match",
    path: ["confirmPassword"]
});

export const bioSchema = z.object({
    bio: z.string({ error: "Bio must be a string" })
    .max(160, "Bio must be at most 160 characters long")
    .optional().nullable()
});

export const titleSchema = z.object({
    title: z.enum(["Doctor", "Staff", "Admin"], {
        error: (issue) => {
            if (issue.code === "invalid_value" && issue.received === "undefined") {
                return "Title is required";
            }
            return "Please select a valid role (Doctor, Staff, Admin)";
        }
    })
});

export const statusSelect = [
    { value: "PENDING", label: "Pending" },
    { value: "ACCEPTED", label: "Accepted" },
    { value: "REJECTED", label: "Rejected" }
] as const;

const statusSelectValues = statusSelect.map(s => s.value);

export const titleAdminConfirmationSchema = z.object({
    status: z.enum(statusSelectValues as [string, ...string[]], {
        error: "Please select the status"
    })
});