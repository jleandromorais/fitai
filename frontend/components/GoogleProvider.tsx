"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { useRef } from "react";

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;

export default function GoogleProvider({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false);
  if (!initialized.current) initialized.current = true;

  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      {children}
    </GoogleOAuthProvider>
  );
}
