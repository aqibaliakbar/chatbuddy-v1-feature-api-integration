import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SidebarState {
  isMainHovered: boolean;
  isPinned: boolean;
  showMobileInbox: boolean;
  setIsMainHovered: (isHovered: boolean) => void;
  setIsPinned: (isPinned: boolean) => void;
  setShowMobileInbox: (showMobileInbox: boolean) => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isMainHovered: false,
      isPinned: false,
      showMobileInbox: false,
      setIsMainHovered: (isHovered) => set({ isMainHovered: isHovered }),
      setIsPinned: (isPinned) => set({ isPinned: isPinned }),
      setShowMobileInbox: (showMobileInbox) =>
        set({ showMobileInbox: showMobileInbox }),
    }),
    {
      name: "sidebar-storage",
      partialize: (state) => ({ isPinned: state.isPinned }), 
    }
  )
);
