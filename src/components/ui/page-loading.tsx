'use client'

import { motion } from "framer-motion"

export function PageLoading () {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background/80 backdrop-blur-sm">
            <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="relative flex items-center justify-center"
            >
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary border-opacity-50" />
                <motion.div 
                    className="absolute inset-0 rounded-full border-4 border-primary/20"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
            </motion.div>
            <p className="mt-7 text-lg font-medium text-muted-foreground animate-pulse">Loading...</p>
        </div>
    )
}