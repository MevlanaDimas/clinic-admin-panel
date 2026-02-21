import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ToastProvider } from "@/provider/toast-provider";
import { Suspense } from "react";
import { PageLoading } from "@/components/ui/page-loading";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { cookies } from "next/headers";
import NotificationWatcher from "@/components/RoleRequestWatcher";
import { auth, currentUser } from "@clerk/nextjs/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: '%s | Clinic App',
    default: 'Clinic App'
  },
  description: "Clinic Content Managegement System App"
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const theme = cookieStore.get("theme")?.value || "light";

  return (
    <ClerkProvider
      afterSignOutUrl="/"
      appearance={{ 
        variables: {
          colorBackground: "var(--background)",
          colorText: "var(--foreground)",
          colorInputBackground: "var(--input)",
          colorInputText: "var(--foreground)",
          colorPrimary: "var(--primary)",
          colorTextOnPrimaryBackground: "var(--primary-foreground)",
          colorTextSecondary: "var(--muted-foreground)",
          borderRadius: "var(--radius)",
        },
        elements: {
          userButtonPopoverCard: "bg-popover border border-border shadow-md",
          
          userButtonPopoverActionButton: {
            color: "hsl(var(--foreground)) !important",
            "&:hover": {
              backgroundColor: "hsl(var(--accent))",
              color: "hsl(var(--accent-foreground)) !important",
            }
          },
          
          userButtonPopoverActionButtonIcon: "text-muted-foreground",
          userButtonPopoverFooter: "hidden",
          card: "bg-card text-card-foreground border border-border shadow-sm",
          headerTitle: "text-foreground",
          headerSubtitle: "text-muted-foreground",
          socialButtonsBlockButtonText: "text-foreground",
        }
      }}
    >
      <html lang="en" className={theme} style={{ colorScheme: theme }} suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          suppressHydrationWarning
          >
            <NotificationWatcher />
            <Suspense fallback={<PageLoading />}>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
                <ToastProvider />
                {children}
              </ThemeProvider>
            </Suspense>
        </body>
      </html>
    </ClerkProvider>
  );
}
