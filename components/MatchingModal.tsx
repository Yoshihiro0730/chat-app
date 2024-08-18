import React, { useState, useEffect, useCallback } from "react"
import { getDatabase, ref as dbRef, onValue, off, get, set, update, runTransaction } from "firebase/database";
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface MatchingProps {
    userId:string,
    sendUserId:string,
    onClose : () => void
}

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };

const MatchingModal: React.FC<MatchingProps> = ({ userId, sendUserId, onClose }) => {
    const [myUrl, setMyUrl] = useState('');
    const [youUrl, setYouUrl] = useState('');
    const [roomId, setRoomId] = useState('');

    useEffect(() => {
        const db = getDatabase();
        const likesRef = dbRef(db, `likes/${userId}/${sendUserId}`);

        const unsubscribe = onValue(likesRef, async(snapshot) => {
            const data = snapshot.val();
            const likeKey = Object.keys(data)[0];
            if (data[likeKey].matchingFlag === 1) {
                const newChatId = generateRoomId(userId, sendUserId);
                setRoomId(newChatId);
                await getMatching(newChatId);
            }
        })
        return () => {
            off(likesRef, 'value', unsubscribe);
        };
    }, [userId, sendUserId]);

    const getMatching = useCallback(async( roomId: string ) => {
        try{
            const db = getDatabase();
            const Ref = dbRef(db, `users/`);
            const snapShot = await get(Ref);
            if (snapShot.exists()){
                const data = snapShot.val();
                console.log(data);
                if(data[userId] && data[sendUserId]){
                    setMyUrl(data[userId].photoUrl);
                    setYouUrl(data[sendUserId].photoUrl);
                }
            }
            await makeChatRoom(roomId);
            console.log("あなたの写真", myUrl);
            console.log("お相手の写真", youUrl);
        } catch(error){
            console.log("ユーザー情報の取得に失敗しました。", error);
            throw error;
        }
    }, [userId, sendUserId, myUrl, youUrl]);

    const generateRoomId = useCallback((uid1: string, uid2: string) => {
        const sortedIds = [uid1, uid2].sort();
        return `chat_${sortedIds[0]}_${sortedIds[1]}`;
    }, []);

    const makeChatRoom = useCallback(async (id: string) => {
        const db = getDatabase();
        const Ref = dbRef(db, `chats/${id}`);
        const userRef = dbRef(db, `users/${userId}/chats/${id}`);
        const otherUserRef = dbRef(db, `users/${sendUserId}/chats/${id}`);
        try {
            const result = await runTransaction(Ref, (currentData: any) => {
                if(currentData === null) {
                    return {
                        participants: {
                            [userId]: userId,
                            [sendUserId]: sendUserId 
                        },
                        createdAt: Date.now()
                    };
                } else {
                    return;
                }
            })
            if(result.committed) {
                const userRef = dbRef(db, `users/${userId}/chats/${id}`);
                const otherUserRef = dbRef(db, `users/${sendUserId}/chats/${id}`);
            }
            
            await Promise.all([
                set(userRef, true),
                set(otherUserRef, true)
            ])
            
            // const snapShot = await get(Ref);
            // if (!snapShot.exists()) {
            //     const participants = {
            //         [userId]: userId,
            //         [sendUserId]: sendUserId 
            //     };
                
            //     await set(Ref, {
            //         participants: participants,
            //         createdAt: Date.now()
            //     });
            console.log("チャットルームができました。");
        } catch (error) {
            console.error("サーバ接続に失敗しました。", error);
        }
    }, [userId, sendUserId]);

    return ( 
        <Modal
            open={true}
            onClose={onClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                <Typography id="modal-modal-title" variant="h6" component="h2">
                    マッチングしました！
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2 }}>
                    <img src={myUrl} alt="My Photo" style={{ width: '45%', height: 'auto' }} />
                    <img src={youUrl} alt="Your Photo" style={{ width: '45%', height: 'auto' }} />
                </Box>
            </Box>
        </Modal>
    )
}

export default MatchingModal;