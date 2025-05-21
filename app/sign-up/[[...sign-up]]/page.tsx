"use client";

import { SignUp, useUser } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";

export default function SignupPage() {
  const { user } = useUser();
  const { theme } = useTheme();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      {!user ? (
        <SignUp
          appearance={{
            baseTheme: theme == "dark" ? dark : undefined,
          }}
          redirectUrl="/create-new-user"
          forceRedirectUrl="/create-new-user"
        />
      ) : (
        <div>You are signed in!</div>
      )}
    </main>
  );
}
