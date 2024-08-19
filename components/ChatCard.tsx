import React, { useState, useEffect } from "react"
import { getDatabase, ref, get } from "firebase/database";
import { Avatar } from "@mui/material";
import List from '@mui/material/List';
import { Box } from "@mui/material";
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Typography from '@mui/material/Typography';
import { Paper } from "@mui/material";
import { styled } from '@mui/material/styles';

import Loading from "./Loading";

const StyledListItem = styled(ListItem)(({ theme }) => ({
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
    cursor: 'pointer',
    padding: theme.spacing(2),
    display: 'flex',
    alignItems: 'center'
  }));

const StyledPaper = styled(Paper)(({ theme }) => ({
    margin: theme.spacing(1),
    overflow: 'hidden',
    borderRadius: theme.shape.borderRadius,
}));

interface ChatCardProps {
    id: string;
    participants: { [userId: string]: string };
    currentUserId: string
}

interface UserData {
    nickname: string;
    photoUrl: string | null;
}

const ChatCard: React.FC<ChatCardProps> = ({ id, participants, currentUserId }) => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [otherUserId, setOtherUserId] = useState<string>("")

    useEffect(() => {
        const otherId = Object.keys(participants).find(userId => userId !== currentUserId);
        setOtherUserId(otherId || '');
    }, [participants, currentUserId]);

    useEffect(() => {
        const fetchUserData = async() => {
            if (!otherUserId) return;
            const db = getDatabase();
            const userRef = ref(db, `users/${otherUserId}`);
            try {
                const snapShot = await get(userRef);
                if(snapShot.exists()){
                    const data = snapShot.val();
                    setUserData({
                        nickname: data.nickname || "Unknown User",
                        photoUrl: data.photoUrl || null
                    })
                } else {
                    console.log("ユーザーデータが見つかりません");
                    setUserData({
                        nickname: "Unknown User",
                        photoUrl: null
                    });
                }
            } catch(error) {
                console.log("ユーザー情報の取得に失敗しました。", error);
                setUserData({
                    nickname: "",
                    photoUrl: null
                })
            } finally {
                setIsLoading(false);
            }  
        }
        fetchUserData();
    }, [otherUserId])

    if(isLoading){
        return <Loading />
    }

    if (!userData) {
        return null;
    }

    return (
        <StyledPaper elevation={1}>
            <StyledListItem>
                <ListItemAvatar>
                    <Avatar 
                        alt={userData.nickname} 
                        src={userData.photoUrl || undefined}
                        sx={{ width: 50, height: 50 }}
                    />
                </ListItemAvatar>
                <ListItemText
                    primary={
                        <Typography variant="subtitle1" component="span" fontWeight="bold">
                            {userData.nickname}
                        </Typography>
                    }
                    sx={{ my: 0 }}
                />
            </StyledListItem>
        </StyledPaper>
    )
}

export default ChatCard;