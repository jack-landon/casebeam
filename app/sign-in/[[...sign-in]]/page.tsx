"use client";

import { SignIn, useUser } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";

export default function LoginPage() {
  const { user } = useUser();
  const { theme } = useTheme();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      {!user ? (
        <SignIn
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
