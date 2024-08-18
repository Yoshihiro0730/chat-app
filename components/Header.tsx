"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image"
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import { getStorage, ref, getDownloadURL } from 'firebase/storage'
import { getDatabase, ref as dbRef, get } from 'firebase/database';
import { signOut } from 'firebase/auth';
import { auth } from "@/lib/FirebaseConfig";

interface HeaderProps {
    userId: string | null | undefined
}

const Header: React.FC<HeaderProps> = ({ userId }) => {
    const [imgUrl, setImgUrl] = useState<string | null>(null);
    const [name, setName] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            if (!userId) return;

            const db = getDatabase();
            const userRef = dbRef(db, `users/${userId}`);
            
            try {
                const snapshot = await get(userRef);
                if (snapshot.exists()) {
                    const userData = snapshot.val();
                    setName(userData.nickName || '');
                    if (userData.photoUrl) {
                        const storage = getStorage();
                        const storageRef = ref(storage, userData.photoUrl);
                        const url = await getDownloadURL(storageRef);
                        setImgUrl(url);
                    }
                }
            } catch (error) {
                console.error("ユーザーデータの取得に失敗しました", error);
            }
        };

        fetchUserData();
    }, [userId]);

    const logoutHandler = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("ログアウトに失敗しました", error);
        }
    };

    return (
        <header className="w-full">
            <div className="bg-lime-200 w-full !flex !flex-row justify-between">
                <Image src="/logo.png" alt="logo_image" height={50} width={50} className="rounded-lg ml-3" />
                <div className="flex">
                    <Button className="mr-3" variant="contained" onClick={logoutHandler}>ログアウト</Button>
                    <Stack direction="row" spacing={2} className="mb-auto mt-auto mr-2">
                        <Avatar alt={name} src={imgUrl || undefined} />
                    </Stack>
                </div>
            </div>
        </header>
    )
}

export default Header;