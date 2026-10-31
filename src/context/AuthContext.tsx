"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { UserRole } from "@/types";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export interface UserProfile {
  id: string;
  fullName: string;
  role: UserRole;
  email: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  role: UserRole;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  // Explicitly labeled preview mode for demo evaluation when not logged in
  demoPreviewRole: UserRole | null;
  setDemoPreviewRole: (role: UserRole | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [demoPreviewRole, setDemoPreviewRoleState] = useState<UserRole | null>(null);
  const router = useRouter();

  const fetchProfile = async (currentUser: User) => {
    if (!supabase) return;
    try {
      // Query the trusted database profiles record. NEVER rely on user metadata!
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, role")
        .eq("id", currentUser.id)
        .single();

      if (error) {
        console.warn("Could not fetch profile, defaulting to customer:", error.message);
        setProfile({
          id: currentUser.id,
          fullName: currentUser.user_metadata?.full_name || currentUser.email?.split("@")[0] || "User",
          role: "customer",
          email: currentUser.email || "",
        });
      } else if (data) {
        setProfile({
          id: data.id,
          fullName: data.full_name || currentUser.email?.split("@")[0] || "User",
          role: data.role as UserRole,
          email: currentUser.email || "",
        });
      }
    } catch (err) {
      console.error("Error reading profile:", err);
    }
  };

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        await fetchProfile(currentUser);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user);
    }
  };

  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
    setDemoPreviewRoleState(null);
    router.push("/auth/login");
  };

  const setDemoPreviewRole = (role: UserRole | null) => {
    setDemoPreviewRoleState(role);
  };

  // Determine active effective role:
  // 1. If signed in, the role ALWAYS comes from the trusted DB profile record.
  // 2. If not signed in and demoPreviewRole is chosen, uses the preview role with clear indicator.
  // 3. Otherwise defaults to "customer".
  const effectiveRole: UserRole = profile?.role ?? demoPreviewRole ?? "customer";

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role: effectiveRole,
        isLoading,
        signOut,
        refreshProfile,
        demoPreviewRole,
        setDemoPreviewRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Re-export useRole for backwards compatibility with existing UI components
export const useRole = () => {
  const { role, profile, user, demoPreviewRole, setDemoPreviewRole } = useAuth();

  return {
    role,
    setRole: (newRole: UserRole) => setDemoPreviewRole(newRole),
    mockUser: {
      name: profile?.fullName || (user?.email ? user.email.split("@")[0] : `Demo ${role.toUpperCase()}`),
      email: profile?.email || user?.email || `${role}@subscriptions.internal`,
      role,
    },
    isAuthenticated: Boolean(user),
  };
};
