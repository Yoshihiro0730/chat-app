"use client";

import React from 'react';
import ChatList from './ChatList';
import { useUser } from '../../contexts/UserContext';
import Loading from '@/components/Loading';

export default function ChatPage() {
  const { user, loading } = useUser();

  if(loading) {
    return <Loading />
  }

  if(!user) {
    return alert("ログインしてください。")
  }

  return (
    <div>
      <h1>チャット一覧</h1>
      <ChatList userId={user.uid} />
    </div>
  );
}