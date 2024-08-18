"use client";

import { UserProvider, useUser } from '../contexts/UserContext';
import Auth from '../components/Auth';
import { LayoutContent } from '../components/LayoutContent';
import Loading from '@/components/Loading';
import "./globals.css";


function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();

  if (loading) {
    return <Loading /> 
  }

  if (!user) {
    return <Auth />;
  }

  return <LayoutContent>{children}</LayoutContent>;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <UserProvider>
          <RootLayoutContent>{children}</RootLayoutContent>
        </UserProvider>
      </body>
    </html>
  );
}