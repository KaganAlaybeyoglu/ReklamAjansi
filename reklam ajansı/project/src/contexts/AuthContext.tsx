import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;

  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => Promise<{ error: any }>;
  signOut: () => Promise<void>;

  // ✅ Flicker fix: UI state’i anında unauth yap
  forceSignOutUI: () => void;

  // ✅ Flicker fix: signup sonrası gelen SIGNED_IN event’ini yok say
  markJustSignedUp: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // signup sonrası 2-3 saniye SIGNED_IN event’ini ignore etmek için
  const ignoreAuthUntilRef = useRef<number>(0);

  const forceSignOutUI = () => {
    setSession(null);
    setUser(null);
    setLoading(false);
  };

  const markJustSignedUp = () => {
    ignoreAuthUntilRef.current = Date.now() + 3000; // 3sn yeter
  };

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!mounted) return;

      if (error) {
        setSession(null);
        setUser(null);
      } else {
        // signup sonrası ignore penceresindeysek session’ı UI’a yansıtma
        if (Date.now() < ignoreAuthUntilRef.current) {
          setSession(null);
          setUser(null);
        } else {
          setSession(data.session ?? null);
          setUser(data.session?.user ?? null);
        }
      }
      setLoading(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted) return;

      // signup sonrası kısa süreli session gelirse UI’da göstermeyelim
      if (Date.now() < ignoreAuthUntilRef.current) {
        setSession(null);
        setUser(null);
        setLoading(false);
        return;
      }

      setSession(newSession ?? null);
      setUser(newSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { firstName, lastName },
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = useMemo(
    () => ({
      user,
      session,
      loading,
      signIn,
      signUp,
      signOut,
      forceSignOutUI,
      markJustSignedUp,
    }),
    [user, session, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
