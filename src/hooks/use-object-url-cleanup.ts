import { useEffect, useRef } from "react";


export function useObjectUrlCleanup(urls: (string | null | undefined)[]) {
    const urlsRef = useRef(urls);

    // keep current urls in ref for use in the unmount cleanup
    useEffect(() => {
        urlsRef.current = urls;
    }, [urls]);

    // only run cleanup on unmount — previously this effect ran on every render
    // causing freshly-created object URLs to be revoked immediately.
    useEffect(() => {
        return () => {
            urlsRef.current.forEach((url) => {
                if (url && typeof url === 'string' && url.startsWith('blob:')) {
                    URL.revokeObjectURL(url);
                }
            })
        }
    }, [])
}