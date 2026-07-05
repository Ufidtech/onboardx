import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fires once immediately with the current auth state, then again
    // every time the user logs in or out -- same "live subscription"
    // idea as onSnapshot(), just for auth instead of Firestore data.
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// A small hook so any component can do `const { user } = useAuth()`
// instead of importing AuthContext + useContext everywhere.
export function useAuth() {
  return useContext(AuthContext);
}
