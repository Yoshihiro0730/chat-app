import React ,{ useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { getDatabase, ref, get, child } from "firebase/database";

import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import Loading from '@/components/Loading';
import ResistUserInfo from '@/components/ResistUserInfo';
import UserList from '@/components/UserList';
import { LayoutContent } from "@/components/LayoutContent";
import { useUser } from '@/contexts/UserContext';

interface ResistUserId {
    userId?:string;
    onLogout:() => void;
}

const Mypage:React.FC<ResistUserId> = ({userId, onLogout }) => {
    const [islogin, setIslogin] = useState(false);
    const [userData, setUserdata] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { user } = useUser();

    const fetchUserData = async(userId:string) => {
        const Ref = ref(getDatabase());
        try {
            const snapShot = await get(child(Ref, `users/${userId}`));
            if(snapShot.exists()) {
                return snapShot.val();
            } else {
                console.log("ユーザー情報を読み込めませんでした。");
                return null;
            }
        } catch(error) {
            console.log("想定外エラーが発生しました。", error)
        }
    }

    const loginHandler = () => {
        setIslogin(true);
    }

    useEffect(() => {
        if(userId) {
            loginHandler();
        }
    }, [userId]);

    useEffect(() => {
        const getUserData = async() => {
            if( islogin && userId ){
                try {
                    const data = await fetchUserData(userId);
                    console.log("ユーザーデータ",data);
                    setUserdata(data);
                } catch(error){
                    console.log("ユーザー情報取得に失敗しました。", error)
                } finally {
                    setTimeout(() => setLoading(false), 1000);
                }
            }
        }
        getUserData();
    }, [islogin, userId]);

    if(loading) {
        return <Loading />
    }

    const logoutHandler = () => {
        setIslogin(false);
        setUserdata(null);
        onLogout();
    } 

    const completeHandler = async () => {
        if(userId){
            try{
                const data = await fetchUserData(userId);
                setUserdata(data);
            } catch (error) {
                console.log("想定外のエラーです。", error);
            }
        }
    }

    return (
        <>
            {userData.registStatus ? (
            
            <UserList userId={userId!}/>
            ):(
            <ResistUserInfo userId={userId!} onComplete={completeHandler} />
            )}
        </>
    )
}

export default Mypage;