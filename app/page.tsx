"use client"
import { onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from "react";
import { auth } from "@/lib/FirebaseConfig";
import Auth from "@/components/Auth";
import Mypage from "./mypage/Mypage";
import Loading from "@/components/Loading";
import { LayoutContent } from "@/components/LayoutContent";
import { UserProvider } from '@/contexts/UserContext';

export default function Home() {
  const [islogin, setIslogin] = useState(false);
  const [userId, setUserId] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIslogin(true);
        setUserId(user.uid);
      } else {
        setIslogin(false);
        setUserId(undefined);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const AuthHandler = (islogin:boolean, userId?:string) => {
    setIslogin(islogin);
    setUserId(userId);
  }

  const logoutHandler = () => {
    setIslogin(false);
    setUserId(undefined);
  }

  if (loading) {
    return <Loading />;
  }

  return (
    <>
        {islogin ? (
          <Mypage userId={userId} onLogout={logoutHandler}/>
        ):(
          <Auth />
        )}
        {/* <Auth onAuthComplete={AuthHandler} /> */}
    </>
  );
}
