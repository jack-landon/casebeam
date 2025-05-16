import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
// import ChatSupport from "@/components/chat-support";
import Header from "./components/Header";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import { UserDataProvider } from "./components/providers/UserDataProvider";
import { getUserData } from "./lib/db/queries/query";
import { CurrentSearchResultsProvider } from "./components/providers/CurrentSearchResultsProvider";
import { CurrentArticleProvider } from "./components/providers/CurrentArticleProvider";
import { CurrentNoteProvider } from "./components/providers/CurrentNoteProvider";
import { CurrentModalProvider } from "./components/providers/CurrentModalProvider";

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
});

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "👨‍⚖️ Case Beam",
  description: "The AI-Powered Legal Assistant",
  icons: {
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const userData = await getUserData();

  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${lora.variable} ${inter.className} bg-muted/30`}>
          <ThemeProvider attribute="class" defaultTheme="light">
            <CurrentModalProvider>
              <UserDataProvider initialUserData={userData}>
                <CurrentNoteProvider>
                  <CurrentSearchResultsProvider>
                    <CurrentArticleProvider>
                      <>
                        <Header />
                        {children}
                      </>
                      <Toaster />
                      {/* <ChatSupport /> */}
                    </CurrentArticleProvider>
                  </CurrentSearchResultsProvider>
                </CurrentNoteProvider>
              </UserDataProvider>
            </CurrentModalProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
