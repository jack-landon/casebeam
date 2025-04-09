"use client";

import { SignUp, useUser } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function SignupPage() {
  const { user } = useUser();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      {!user ? (
        <SignUp
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
