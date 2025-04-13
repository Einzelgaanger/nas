
import { useState, useEffect } from "react";

export type UserInfo = {
  id?: string;
  name: string;
  region?: string;
  region_id?: string; // Adding region_id as an optional property
  phone?: string;
};

export function useUserInfo() {
  const [user, setUser] = useState<UserInfo | null>(() => {
    const savedUser = localStorage.getItem("userInfo");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const updateUser = (userInfo: UserInfo | null) => {
    setUser(userInfo);
    if (userInfo) {
      localStorage.setItem("userInfo", JSON.stringify(userInfo));
    } else {
      localStorage.removeItem("userInfo");
    }
  };

  return { user, updateUser };
}
