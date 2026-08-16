import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { Footer } from "./footer";
import { Header } from "./header";
import { Providers } from "./providers";
import { ThemeProvider } from "./theme-provider";

import { THEME_COOKIE_NAME, type Theme } from "@/lib/theme";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Expense Tracker",
  description: "A portfolio expense tracker app",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const cookieStore = await cookies();
  // Read server-side so the very first response already renders with the
  // right theme class on <html> - no flash-of-wrong-theme on load.
  const theme: Theme = cookieStore.get(THEME_COOKIE_NAME)?.value === "dark" ? "dark" : "light";

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${theme === "dark" ? "dark" : ""} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <ThemeProvider initialTheme={theme}>
            <Header />
            {children}
            <Footer />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
