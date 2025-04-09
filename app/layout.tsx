import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
// import ChatSupport from "@/components/chat-support";
import Header from "./components/Header";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.className} bg-muted/30`}>
          <ThemeProvider attribute="class" defaultTheme="system">
            <>
              <Header />
              {children}
            </>
            <Toaster />
            {/* <ChatSupport /> */}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
