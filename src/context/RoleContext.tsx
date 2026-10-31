"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserRole } from "@/types";

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  mockUser: {
    name: string;
    email: string;
    role: UserRole;
  };
}

const mockUsers: Record<UserRole, { name: string; email: string; role: UserRole }> = {
  admin: {
    name: "Alex Vance (Admin)",
    email: "alex.admin@subscriptions.internal",
    role: "admin",
  },
  staff: {
    name: "Morgan Lee (Billing Staff)",
    email: "morgan.staff@subscriptions.internal",
    role: "staff",
  },
  customer: {
    name: "Acme Logistics Ltd (Customer)",
    email: "billing@acmelogistics.com",
    role: "customer",
  },
};

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [role, setRoleState] = useState<UserRole>("admin");

  useEffect(() => {
    const saved = localStorage.getItem("sub_mgmt_demo_role") as UserRole;
    if (saved && (saved === "admin" || saved === "staff" || saved === "customer")) {
      setRoleState(saved);
    }
  }, []);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    localStorage.setItem("sub_mgmt_demo_role", newRole);
  };

  return (
    <RoleContext.Provider
      value={{
        role,
        setRole,
        mockUser: mockUsers[role],
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
};
