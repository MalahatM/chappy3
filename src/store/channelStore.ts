import { create } from "zustand";
// Define the structure of a channel
interface Channel {
  name: string;
  isPrivate: boolean;
}

interface ChannelState {
  channels: Channel[];
  currentChannel: string | null;
   setChannels: (channels: Channel[]) => void;
  setCurrentChannel: (name: string) => void;
}
// Zustand store for channel management
export const useChannelStore = create<ChannelState>((set) => ({
  channels: [
    { name: "#Coders group", isPrivate: true },
    { name: "#Funny group", isPrivate: true },
    { name: "#group1", isPrivate: false },
    { name: "#group2", isPrivate: false },
  ],
  // Currently selected channel
  currentChannel: null,
  setChannels: (channels) => set({ channels }),
  setCurrentChannel: (name) => set({ currentChannel: name }),
}));
