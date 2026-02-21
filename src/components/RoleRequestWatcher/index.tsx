'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useNotificationStore } from '@/store/use-notification-store';
import { generateFaviconDataUrl, syncFaviconToDOM } from '@/lib/favicon-utils';
import { useUser } from '@clerk/nextjs';


export default function RoleRequestWatcher() {
  const role = useUser().user?.publicMetadata.title;
  
  const pathname = usePathname();
  const { unreadCount, initialize } = useNotificationStore();
  const flashTimer = useRef<NodeJS.Timeout | null>(null);
  const currentFaviconUrl = useRef<string>("");

  useEffect(() => {
    if (role === 'Admin') {
      initialize(); // Initial fetch and Pusher subscription
    }
  }, [initialize, role]);

  useEffect(() => {
    if (role !== 'Admin') return;

    const updateUI = async () => {
      // 1. Generate the icon once per count change
      currentFaviconUrl.current = await generateFaviconDataUrl(unreadCount);
      
      // 2. Clear any existing intervals
      if (flashTimer.current) clearInterval(flashTimer.current);

      const originalTitle = document.title;
      const notificationTitle = `(${unreadCount}) New Role Request! | Clinic App`;

      if (unreadCount > 0) {
        let i = 0;
        flashTimer.current = setInterval(() => {
          // Toggle the Title
          document.title = (i % 2 === 0) ? notificationTitle : originalTitle;
          
          // CRITICAL: Re-sync the favicon on EVERY tick of the title flash.
          // This prevents Next.js or the browser from reverting the icon.
          syncFaviconToDOM(currentFaviconUrl.current);
          
          i++;
        }, 1000);
      } else {
        document.title = originalTitle;
        syncFaviconToDOM(currentFaviconUrl.current); // Apply normal logo (no dot)
      }
    };

    updateUI();

    return () => {
      if (flashTimer.current) clearInterval(flashTimer.current);
    };
  }, [unreadCount, pathname, role]);

  if (role !== 'Admin') {
    return null;
  }

  return null;
}