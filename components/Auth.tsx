import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, onAuthStateChanged } from "firebase/auth"
import { getDatabase, ref, set, get } from "firebase/database";
import React, { useState } from 'react';
import { Button, TextField, Typography } from '@mui/material';
import { styled } from '@mui/system';
import { auth, db } from "@/lib/FirebaseConfig";
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import SendIcon from '@mui/icons-material/Send';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import { FirebaseError } from "firebase/app";
import { useRouter } from 'next/navigation';
import { useUser } from '../contexts/UserContext';

const Container = styled('div')({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#f0f0f0',
});

const LoginCard = styled('div')({
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
});

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

const Auth: React.FC = () => {
    const router = useRouter();
    const { setUser } = useUser();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [islogin, setIslogin] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const [resetEmail, setResetEmail] = useState("");

    const registerButton = async () => {
        try{
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            setUser(user);
            await signInEmail();
        } catch(error) {
        // 登録失敗　<- 後でモーダルにしたい
        console.log(error);
        };
    }

    const signInEmail = async () => {
        try{
            // ユーザー情報の取得
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            setUser(user)
            const user_id = user.uid;

            // DB接続
            const db = getDatabase();
            const userRef = ref(db, 'users/' + user_id);

            // DBにすでにデータがあるか確認
            const snapShot = await get(userRef);
            if (!snapShot.exists()) {
                await set(ref(db, 'users/' + user_id), {
                    email: email,
                    registStatus: false
                });
            }
        }
         catch (error) {
            if (error instanceof FirebaseError) {
                console.log("エラーが発生しました。", error);
                console.log("エラーコード:", error.code);
                console.log("エラーメッセージ:", error.message);
            } else {
                console.log("予期しないエラーが発生しました。", error);
            }
        }
    };

    const sendResetEmail = async (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        if (!resetEmail) {
            alert("メールアドレスを入力してください");
            return;
        }
        try{
            await sendPasswordResetEmail(auth, resetEmail)
            .then(() => {
                setOpenModal(false);
                setResetEmail("");
                console.log(resetEmail)
            })
        } catch (error) {
            alert("エラーが発生しました。");
            setResetEmail("");
        }
    };

    return (
        <Container>
            <LoginCard>
                {islogin ? 
                    <Typography variant="h5" gutterBottom>
                        ログイン
                    </Typography>
                :
                    <Typography variant="h5" gutterBottom>
                        新規登録
                    </Typography>
                }
                <TextField 
                    variant="outlined" 
                    margin="normal" 
                    fullWidth label="E-mail" 
                    onChange={(e) => setEmail(e.target.value)} 
                />
                <TextField 
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    label="パスワード"
                    type="password"
                    onChange={(e) => setPassword(e.target.value)} 
                />
                <div className="flex justify-between mt-2 mb-2">
                    <span onClick={() => setIslogin(!islogin)} className="underline hover:text-blue-700 cursor-pointer">
                        {islogin ? "新規登録はこちら" : "ログイン画面" }
                    </span>
                    <span className="underline cursor-pointer hover:text-blue-700" onClick={() => setOpenModal(true)}>
                        パスワードを忘れた方はこちら
                    </span>
                </div>
                {islogin ? 
                    <Button 
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick= {() => {signInEmail()}}
                    sx={{mx:'auto', mt:2}}
                    >
                        ログイン
                    </Button>
                :
                    <Button 
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick= {() => {registerButton()}}
                    sx={{mx:'auto', mt:2}}
                    >
                        登録
                    </Button>
                }
            </LoginCard>
            <Modal
                open={openModal}
                onClose={() => setOpenModal(false)}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                <Typography id="modal-modal-title" variant="h6" component="h2">
                    パスワード再設定
                </Typography>
                <TextField 
                    id="outlined-basic"
                    label="sample@example.com"
                    variant="outlined"
                    sx={{ width: '100%' }}
                    value={resetEmail}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setResetEmail(e.target.value);
                    }}
                    InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={sendResetEmail}>
                              <SendIcon />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                />
                </Box>
            </Modal>
        </Container>
    )
}

export default Auth