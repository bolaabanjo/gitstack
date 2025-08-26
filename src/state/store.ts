import create from 'zustand';

interface AppState {
  // Define your state properties here
  user: { id: string; name: string } | null;
  setUser: (user: { id: string; name: string } | null) => void;
  theme: string;
  setTheme: (theme: string) => void;
}

const useStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  theme: 'light',
  setTheme: (theme) => set({ theme }),
}));

export default useStore;