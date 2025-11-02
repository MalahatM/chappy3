import { create } from "zustand";
// Define the structure of a user
interface UserState {
  username: string | null;
  token: string | null;
  setUser: (username: string, token: string) => void;
  logout: () => void;
}
// Zustand store for user authentication
export const useUserStore = create<UserState>((set) => ({
  username: null,
  token: null,
  setUser: (username, token) => set({ username, token }),
  logout: () => set({ username: null, token: null }),
}));