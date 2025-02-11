import create from 'zustand';

type SessionStore = {
  session: boolean;
  setSession: (value: boolean) => void;
};

export const useSessionStore = create<SessionStore>((set) => ({
  session: true,
  setSession: (value) => set({ session: value }),
}));