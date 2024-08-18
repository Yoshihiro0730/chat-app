"use client";

import React from 'react';
import { useUser } from '../contexts/UserContext';
import Navigation from './Navigation';
import Header from './Header';

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const { user } = useUser();

  return (
    <div className="flex flex-col min-h-screen">
      <Header userId={user ? user.uid: null} />
      <div style={{ display: 'flex', flex: 1 }}>
        <Navigation userId={user ? user.uid: null} />
        <main className="flex-1 p-5 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}