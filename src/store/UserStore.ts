import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserState {
  username: string | null;
  token: string | null;
  isGuest: boolean;
  hydrated: boolean;
  setUser: (username: string, token: string) => void;
  setGuest: (isGuest: boolean) => void;
  logout: () => void;
  setHydrated: (hydrated: boolean) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      username: null,
      token: null,
      isGuest: false,
      hydrated: false,

      setUser: (username, token) =>
        set({ username, token, isGuest: false }),

      setGuest: (isGuest) =>
        set({ username: "Guest", token: null, isGuest }),

      logout: () =>
        set({ username: null, token: null, isGuest: false }),

      setHydrated: (hydrated) => set({ hydrated }),
    }),
    {
      name: "user-storage",
      onRehydrateStorage: () => (state) => {
        if (state) state.setHydrated(true);
      },
    }
  )
);
