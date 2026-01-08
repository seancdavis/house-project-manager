import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Member } from '../types';

interface UserContextValue {
  currentUser: Member | null;
  setCurrentUser: (member: Member | null) => void;
}

const UserContext = createContext<UserContextValue | null>(null);

const STORAGE_KEY = 'house-project-manager-user';

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<Member | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  });

  const setCurrentUser = (member: Member | null) => {
    setCurrentUserState(member);
    if (member) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(member));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useCurrentUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useCurrentUser must be used within a UserProvider');
  }
  return context;
}
