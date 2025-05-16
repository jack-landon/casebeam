"use client";

import { SignIn, useUser } from "@clerk/nextjs";

export default function LoginPage() {
  const { user } = useUser();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      {!user ? (
        <SignIn
          redirectUrl="/create-new-user"
          forceRedirectUrl="/create-new-user"
        />
      ) : (
        <div>You are signed in!</div>
      )}
    </main>
  );
}
