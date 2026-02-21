import * as z from "zod";


export const targetAudience = [
    { value: "PATIENT", label: "Patient" },
    { value: "GENERAL_PUBLIC", label: "General Public" },
    { value: "MEDICAL_PROFESSIONAL", label: "Medical Professional" },
    { value: "INTERNAL_STAFF", label: "Internal Staff" }
] as const;

const targetAudienceValues = targetAudience.map(a => a.value);

export const evidenceLevel = [
    { value: "META_ANALYSIS", label: "Meta Analysis" },
    { value: "RANDOMIZED_CONTROL", label: "Randomized Control" },
    { value: "OBSERVATIONAL", label: "Observational" },
    { value: "EXPERT_OPINION", label: "Expert Opinion"}
] as const;

const evidenceLevelValues = evidenceLevel.map(e => e.value);

const MAX_FILE_SIZE = 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const newsFormSchema = z.object({
    title: z.string({
            error: (issue) => issue.input === undefined ? "Title is required" : "Title must be a string"
        })
        .min(3, "Title must be at least 3 characters long")
        .max(255, "Title must be at most 255 characters long"),
    content: z.string({
            error: (issue) => issue.input === undefined ? "Content is required" : "Content must be a string"
        })
        .min(50, "Content must be at least 50 characters long"),
    images: z.array(z.object({
        id: z.number().nullable().optional(),
        image: z
            .custom<File | null>()
            .nullable()
            .refine((file) => !file || file.size <= MAX_FILE_SIZE, "Max file size is 1MB.")
            .refine((file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type), "Only .jpg, .jpeg, .png and .webp files are accepted."),
        imageUrl: z.string({ error: "Invalid URL format" }).optional(),
        imageName: z.string({ error: "Image name must be a string" }).optional(),
    })).optional(),
    author: z.string({
        error: (issue) => issue.input === undefined ? "Author is required" : "Author must be a string"
    }),
    category: z.object({
        label: z.string({ error: "Category must be a string" }),
        value: z.number()
    }).nullable().optional(),
    summary: z.string({
            error: (issue) => issue.input === undefined ? "Summary is required" : "Summary must be a string"
        })
        .min(50, "Summary must be at least 50 characters long")
        .max(500, "Summary must be at most 500 characters long"),
    tags: z.array(z
        .string({error: "Tag must be a string" })
        .min(3, "Tag must be at least 3 characters long")
    ).nullable().optional(),
    sourceLinks: z.array(z
        .url("Invalid URL format")
        .min(5, "URL must be at least 5 characters long")
    ).nullable().optional(),
    targetAudience: z.enum(targetAudienceValues as [string, ...string[]], {
        error: "Please select the target audience"
    }),
    evidenceLevel: z.enum(evidenceLevelValues as [string, ...string[]]).nullable().optional()
});