import * as z from "zod";


const MAX_FILE_SIZE = 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const promoFormSchema = z.object({
    code: z.string({
        error: (issue) => issue.input === undefined ? "Code is required" : "Code must be a string"
    })
    .min(5, "Code must be at least 5 characters long")
    .max(10, "Code must be at most 10 characters long"),
    headline: z.string({
        error: (issue) => issue.input === undefined ? "Headline is required" : "Headline must be a string"
    })
    .min(3, "Headline must be at least 3 characters long")
    .max(30, "Headline must be at most 30 characters long"),
    description: z.string({
        error: (issue) => issue.input === undefined ? "Description is required" : "Description must be a string"
    })
    .max(130, "Description must be at most 130 characters long"),
    CTA: z.string({
        error: (issue) => issue.input === undefined ? "CTA is required" : "CTA must be a string"
    })
    .min(5, "CTA must be at least 5 characters long")
    .max(40, "CTA must be at most 40 characters long"),
    category: z.string({ error: "Category must be a string" })
    .min(1, "Category must be at least 1 character long")
    .optional(),
    images: z.array(z.object({
        id: z.number().nullable().optional(),
        image: z
            .custom<File | null>()
            .nullable()
            .refine((file) => !file || file.size <= MAX_FILE_SIZE, "Max file size is 1MB.")
            .refine((file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type), "Only .jpg, .jpeg, .png and .webp files are accepted."),
        imageUrl: z.string({ error: "Invalid URL format" }).optional(),
        imageName: z.string({ error: "Image name must be a string" }).optional(),
    })).max(1, "Maximum 1 image is allowed").optional(),
    validUntil: z.date().refine((date) => date >= new Date(), "Date must be in the future.")
});