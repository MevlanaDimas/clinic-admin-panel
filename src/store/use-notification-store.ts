import { create } from 'zustand';
import axios from 'axios';
import { pusherClient } from "@/lib/pusher";


interface NotificationState {
  unreadCount: number;
  initialize: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  initialize: async () => {
    try {
      const res = await axios.get('api/staff/role-request');
      set({ unreadCount: res.data.length });
    } catch (e) { console.error(e); }

    const channel = pusherClient.subscribe('private-admin-notifications');

    channel.bind('role-update-request', () => {
      set((state) => ({ unreadCount: state.unreadCount + 1 }));
      // Play sound from public/sounds/notification.mp3
      const audio = new Audio('/notification.wav');

      audio.play().catch(() => console.log('Error playing audio'));
    });

    channel.bind('request-resolved', () => {
      set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) }));
    });
  }
}));