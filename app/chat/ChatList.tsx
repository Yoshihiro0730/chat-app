"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getDatabase, ref, get, DataSnapshot } from "firebase/database";
import ChatCard from "@/components/ChatCard";

interface ListProps {
    userId: string
}

interface MatchingItem {
    sendUID: string;
    timestamp: number
}

interface Participants {
    [userId: string]: string;
}

interface ChatProps {
    id: string;
    participants: Participants;
    createdAt: number;
}

const ChatList: React.FC<ListProps> = ({ userId }) => {
    const [matchingList, setMatchingList] = useState<MatchingItem[]>([])
    const [chatID, setChatID] = useState<string[]>([]);
    const [chatRooms, setChatRooms] = useState<ChatProps[]>([]);

    const fetchChatRoom = async () => {
        const db = getDatabase();
        const userRef = ref(db, `users/${userId}/chats`);
        try {
            const snapShot: DataSnapshot = await get(userRef);
            const chatData = snapShot.val()
            if (chatData) {
                const chatIds = Object.keys(chatData);
                const chatRoomPromise = chatIds.map(async(chatId) => {
                    const chatRoomRef = ref(db, `chats/${chatId}`);
                    const chatRoomSnapshot: DataSnapshot = await get(chatRoomRef);
                    const chatRoomData = chatRoomSnapshot.val();
                    if(chatRoomData && chatRoomData.participants && chatRoomData.participants[userId]) {
                        return {
                            id: chatId,
                            participants: chatRoomData.participants,
                            createdAt: chatRoomData.createdAt
                        }
                    }
                    return null;
                });
                const chatRoomData = await Promise.all(chatRoomPromise);
                const filteredChatRooms = chatRoomData.filter((room): room is ChatProps => room !== null);
                setChatRooms(filteredChatRooms);
                console.log("取得したチャットルーム:", filteredChatRooms);
            }
        } catch (error) {
            console.log("マッチングリスト取得に失敗しました。", error);
        }
    }

    useEffect(() => {
        fetchChatRoom();
    }, [userId]);

    useEffect(() => {
        console.log("更新された chatID:", chatID);
    }, [chatID]);

    return (
        <div>
            {chatRooms.length > 0 ? (
                chatRooms.map((room) => (
                    <Link href={`/chat/${room.id}`} key={room.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <ChatCard
                            key={room.id}
                            id={room.id}
                            participants={room.participants}
                            currentUserId={userId}
                        />
                    </Link>
                ))
            ) : (
                <p>チャットルームがありません。</p>
            )}
        </div>
    )
}

export default ChatList;