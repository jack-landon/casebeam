"use client";

import { SignIn, useUser } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function LoginPage() {
  const { user } = useUser();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      {!user ? (
        <SignIn
          redirectUrl="/create-new-user"
          forceRedirectUrl="/create-new-user"
          appearance={{
            baseTheme: dark,
          }}
        />
      ) : (
        <div>You are signed in!</div>
      )}
    </main>
  );
}
