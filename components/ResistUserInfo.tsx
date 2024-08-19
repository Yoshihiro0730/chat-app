import React, { useState } from "react";
import {
    TextField,
    Button,
    Stepper,
    Step,
    StepLabel,
    Typography,
    Container,
    Box,
} from '@mui/material';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { getDatabase, ref as dbRef, update } from "firebase/database";
import Loading from "./Loading";

interface UserProps {
    userId:string;
    onComplete:() => void;
}

const ResistUserInfo:React.FC<UserProps> = ({ userId, onComplete }) => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [nickname, setNickname] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [age, setAge] = useState('');
    const [location, setLocation] = useState('');
    const [portFolio, setPortFolio] = useState('');
    const [photo, setPhoto] = useState<File | null>(null);
    const [loading, setIsloading] = useState(false);

    const [formData, setFormData] = useState({
        nickname: '',
        firstName:'',
        lastName:'',
        age: '',
        location: '',
        portFolio: '',
        photo: null as File | null,
    });

    const steps = ['基本情報', '自己紹介'];

    const inputHandler = (event:React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const target = event.target as HTMLInputElement | HTMLTextAreaElement;
        const { name, value } = target;
        switch (name) {
            case "nickname" :
                setNickname(value);
                break;
            case "firstName":
                setFirstName(value);
                break;
            case "lastName":
                setLastName(value);
                break;
            case "age":
                setAge(value);
                break;
            case "location":
                setLocation(value);
                break;
            case "portFolio":
                setPortFolio(value.slice(0,400));
                break;
        }
    };

    const fileHandler = (event:React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target as HTMLInputElement;
        if(file.files && file.files[0]){
            setPhoto(file.files[0]);
        }
    }

    const nextButtonHandler = () => {
        setFormData(prevData => ({
            ...prevData,
            nickname,
            firstName,
            lastName,
            age,
            location,
            portFolio,
            photo
        }));
        setCurrentQuestion((prevQuestion) => prevQuestion + 1);
    }
    const backButtonHandler = () => {
        setCurrentQuestion((prevQuestion) => prevQuestion - 1);
    }

    const sendHandler = async() => {
        setIsloading(true);
        try{
            const db = getDatabase();
            const userRef = dbRef(db, `users/${userId}`);

            const updateData = {
                nickname:nickname,
                firstName:firstName,
                lastName:lastName,
                age:age,
                location:location,
                portFolio:portFolio,
                registStatus:true
            };
            await update(userRef, updateData);

            if (photo) {
                const storage = getStorage();
                const photoRef = storageRef(storage, `userPhotos/${userId}`);
                await uploadBytes(photoRef, photo);
                const photoUrl = await getDownloadURL(photoRef);
                await update(userRef, { photoUrl });
            }
            onComplete();
        } catch(error) {
            console.log("想定外のエラーが発生しました。", error);
        } finally {
            setIsloading(false);
        }
    };

    if(loading) {
        return <Loading />
    }

    const questionStep = (step:number) => {
        switch (step) {
            case 0:
                return (
                    <>
                        <TextField
                            fullWidth
                            label="ニックネーム"
                            name="nickname"
                            value={nickname}
                            onChange={inputHandler}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="姓"
                            name="lastName"
                            value={lastName}
                            onChange={inputHandler}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="名"
                            name="firstName"
                            value={firstName}
                            onChange={inputHandler}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="年齢"
                            name="age"
                            type="number"
                            value={age}
                            onChange={inputHandler}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="居住地域"
                            name="location"
                            value={location}
                            onChange={inputHandler}
                            margin="normal"
                        />
                        <Box mt={2}>
                            <input
                            type="file"
                            onChange={fileHandler}
                            accept="image/*"
                            />
                            {photo && (
                            <Typography variant="body2" mt={1}>
                                選択されたファイル: {photo.name}
                            </Typography>
                            )}
                        </Box>
                    </>
                )
            case 1:
                return (
                    <TextField
                        fullWidth
                        label="自己紹介文"
                        name="portFolio"
                        value={portFolio}
                        onChange={inputHandler}
                        margin="normal"
                        multiline
                        rows={4}
                        inputProps={{ maxLength: 400 }}
                    />
                )
            default:
                return 'Unknown Question';
        }
        
    }

    return (
        <Container maxWidth="sm">
            <Box mt={4}>
                <Stepper activeStep={currentQuestion}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>
                <Box mt={4}>
                {currentQuestion === steps.length ? (
                    <Box>
                        <Typography>全ての手順が完了しました</Typography>
                        <Button onClick={sendHandler} variant="contained" color="primary" sx={{ mt: 2 }}>
                            登録する
                        </Button>
                    </Box>
                ) : (
                    <Box>
                        {questionStep(currentQuestion)}
                        <Box mt={2}>
                            <Button
                            disabled={currentQuestion === 0}
                            onClick={backButtonHandler}
                            >
                            戻る
                            </Button>
                            <Button
                            variant="contained"
                            color="primary"
                            onClick={currentQuestion === steps.length - 1 ? sendHandler : nextButtonHandler}
                            >
                            {currentQuestion === steps.length - 1 ? '完了' : '次へ'}
                            </Button>
                        </Box>
                    </Box>
                )}
                </Box>
            </Box>
        </Container>
    )
}

export default ResistUserInfo