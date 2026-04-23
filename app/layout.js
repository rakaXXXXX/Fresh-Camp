import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SessionProvider } from "@/components/SessionProvider";
import { icons } from "lucide-react";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  icons: {icon: '/1.png' },
  title: "FreshCamp - Outdoor Gear Cleaning & Store",
  description: "Professional outdoor equipment cleaning and e-commerce",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          {children}
          <Toaster />
        </SessionProvider>
      </body>
     
    </html>
  );
}
