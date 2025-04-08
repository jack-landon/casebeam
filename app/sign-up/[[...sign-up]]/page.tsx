"use client";

import { SignUp, useUser } from "@clerk/nextjs";

export default function SignupPage() {
  const { user } = useUser();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      {!user ? <SignUp /> : <div>You are signed in!</div>}
    </main>
  );
}
