import { create } from "zustand";
// Import persist middleware to keep user data in localStorage even after page reloads
import { persist } from "zustand/middleware";

// Define the structure (type) of the user store
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

// Create Zustand store with persist middleware
export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      username: null,
      token: null,
      isGuest: false,
      hydrated: false,
  // Set user when logging in
      setUser: (username, token) =>
        set({ username, token, isGuest: false }),

      // Set guest mode (no token, username = “Guest”)
      setGuest: (isGuest) =>
        set({ username: "Guest", token: null, isGuest }),
   // Clear all data when logging out
      logout: () =>
        set({ username: null, token: null, isGuest: false }),
 // Mark as hydrated (after reading from localStorage)
      setHydrated: (hydrated) => set({ hydrated }),
    }),
    {
		 // Called when the store is rehydrated (data loaded from localStorage)
      name: "user-storage",
	  //after refresh
      onRehydrateStorage: () => (state) => {
        if (state) state.setHydrated(true);
      },
    }
  )
);
