import React, {useState, useEffect} from "react"
import Button from '@mui/material/Button';
import { getDatabase, ref, get, serverTimestamp, push, update } from "firebase/database";
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';

import MatchingModal from "./MatchingModal";


interface ButtonProps {
    userId:string,
    sendUserId:string,
    kind:1 | 2 | 3 // 1:いいね、2:ありがとう、3:ごめんなさい
}

const SendButton: React.FC<ButtonProps> = ({ userId, sendUserId, kind:initialKind }) => {
    const [isDisabled, setIsDisabled] = useState(false);
    const [kind, setKind] = useState<1 | 2 | 3>(initialKind);
    const [isMatching, setIsMatching] = useState(false);

    useEffect(() => {
        goodStatus()
    },[userId, sendUserId])

    const goodStatus = async () => {
        const db = getDatabase();
        const goodRef = ref(db, `likes/${userId}/${sendUserId}`);
        const snapShot = await get(goodRef);
        if (snapShot.exists()) {
            const likeData = snapShot.val();
            console.log(likeData)
            const likeKey = Object.keys(likeData)[0];
            if (likeData[likeKey] && likeData[likeKey].matchingFlag === 0){
                setKind(2);
            } else {
                setIsDisabled(true);
            } 
        }
    }

    const buttonAction = async () => {
        if (isDisabled) return;
        try {
            // DB接続
            const db = getDatabase();
            let path: string;
            let entry: any;

            switch(kind){
                case 1:
                    path = `likes/${sendUserId}/${userId}`;
                    entry = {
                        timestamp: serverTimestamp(),
                        matchingFlag: 0 
                    };
                    const likesRef = ref(db, path);
                    await push(likesRef, entry);
                    break;
                case 2:
                    path = `likes/${userId}/${sendUserId}`;
                    entry = {
                        timestamp: serverTimestamp(),
                        matchingFlag: 1 
                    };
                    const matchRef = ref(db, path);
                    const snapShot = await get(matchRef);
                    if (snapShot.exists()){
                        const data = snapShot.val();
                        const key = Object.keys(data)[0];
                        await update(ref(db, `${path}/${key}`), entry);
                    }
                    setIsMatching(true);
                    break;
                case 3:
                    path = `likes/${userId}/${sendUserId}`;
                    entry = {
                        timestamp: serverTimestamp(),
                        matchingFlag: 2
                    };
                    break;
                default:
                    throw new Error("ボタン種別が登録されていません。")
            }
            
            setIsDisabled(true);
        } catch(error){
            console.log("いいねが送れませんでした。", error);
        }
    }

    const disableJudge = async () => {

    }

    const buttonText = () => {
        switch(kind) {
            case 1: return "いいね";
            case 2: return "ありがとう";
            case 3: return "ごめんなさい";
        }
    }

    const buttonIcon = () => {
        switch(kind) {
            case 1: return <FavoriteBorderIcon />;
            case 2: return <ThumbUpIcon />;
            case 3: return <></>;
        }
    }

    return (
        <div>
            <Button 
                variant="contained"
                onClick={buttonAction}
                startIcon={buttonIcon()}
                color={kind === 1 ? "primary" : kind === 2 ? "success" : "error"}
                disabled={isDisabled}
            >
                {buttonText()}
            </Button>
            {isMatching && (
                <MatchingModal 
                    userId={userId} 
                    sendUserId={sendUserId} 
                    onClose={() => setIsMatching(false)}
                />
            )}
        </div>
    )
}

export default SendButton