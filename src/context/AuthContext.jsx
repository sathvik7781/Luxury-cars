import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";
import { ADMIN_EMAIL } from "../constants/admin";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ---------- SIGNUP ---------- */
  const signup = async (email, password, profile = {}) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    await setDoc(doc(db, "users", cred.user.uid), {
      email,
      name: profile.name || "",
      phone: profile.phone || "",
      createdAt: serverTimestamp(),
    });

    return cred;
  };

  /* ---------- LOGIN ---------- */
  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  /* ---------- LOGOUT ---------- */
  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  /* ---------- AUTH STATE ---------- */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      // ✅ AUTH FIRST
      const baseUser = {
        uid: currentUser.uid,
        email: currentUser.email,
        isAdmin: currentUser.email === ADMIN_EMAIL,
      };

      setUser(baseUser);
      setLoading(false);

      // 🔵 PROFILE SECOND (NON-BLOCKING)
      try {
        const snap = await getDoc(doc(db, "users", currentUser.uid));

        if (snap.exists()) {
          const profile = snap.data();

          setUser({
            uid: currentUser.uid,
            email: currentUser.email,
            name: profile.name || "",
            phone: profile.phone || "",
            isAdmin: currentUser.email === ADMIN_EMAIL,
          });
        }
      } catch (err) {
        console.warn("Profile fetch failed, continuing without it", err);
        // keep baseUser — DO NOT logout
      }
    });

    return unsub;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signup,
        login,
        logout,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
