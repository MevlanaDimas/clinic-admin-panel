'use client'

export const TagList = ({ tags }: { tags?: string | null }) => {
    if (!tags) return <span className="text-muted-foreground">-</span>

    const tagsArray = tags.split(",")
                          .map((t) => t.trim())
                          .filter(Boolean);

    return (
        <div className="flex flex-wrap gap-2">
            {tagsArray.map((tag: string, i: number) => (
                <span
                    key={i}
                    className="text-xs text-muted-foreground px-2 py-0.5 rouded-md bg-muted/30"
                >
                    {tag}
                </span>
            ))}
        </div>
    )
}