"use client";

import { Provider } from "react-redux";
import { store } from "./store";
import { useEffect } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const ref = searchParams.get("ref");
      if (ref) {
        localStorage.setItem("referralCode", ref);
      }
    }
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
