import { createContext, useContext, ReactNode } from 'react';

interface AuthContextType {
  user: {
    id: string;
    // ... other user properties
  } | null;
  // ... other auth related properties
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // ... your auth provider implementation
}; 