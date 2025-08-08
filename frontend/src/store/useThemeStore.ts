import { create } from "zustand";

// 1. Define the interface for your store's state
interface ThemeState {
  theme: string;
  // setTheme is a function that takes a string 'theme' and returns void
  setTheme: (theme: string) => void;
}

// 2. Use the interface with `create<ThemeState>`
export const useThemeStore = create<ThemeState>((set) => ({
  // Initialize 'theme' state
  theme: localStorage.getItem("streamify-theme") || "coffee",

  // Implement 'setTheme'
  setTheme: (theme: string) => { // Explicitly type the 'theme' parameter here
    localStorage.setItem("streamify-theme", theme);
    // Use the 'set' function (provided by Zustand, automatically typed by `create<ThemeState>`)
    set({ theme });
  },
}));
