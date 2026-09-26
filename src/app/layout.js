import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/provider";
import { FavoritesState } from "@/context";
import { Navbar, Footer } from "@/components/layout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Food Recipe App",
  description: "Discover and save your favorite recipes",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-base-100 text-base-content`}
      >
        <QueryProvider>
          <FavoritesState>
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </FavoritesState>
        </QueryProvider>
      </body>
    </html>
  );
}
