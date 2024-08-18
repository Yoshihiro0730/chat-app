import React, { useState, useEffect } from "react";
import { getDatabase, ref as dbRef, update, get, child } from "firebase/database";
import { Grid, Card, CardContent, Typography, Button, Pagination } from "@mui/material";
import SendButton from "./SendButton";

interface UserProps {
    userId:string
}

interface User {
    id: string,
    nickname:string,
    age:number,
    location:string,
    photoUrl:string
}

const UserList:React.FC<UserProps> = ({ userId }) => {
    const maxUser = 12;
    const [users, setUsers] = useState<User[]>([]);
    const [pages, setPages] = useState(1);
    const [totalPages, setTotalPages] = useState(1);


    useEffect(() => {
        fetchUserData(userId);
    }, [userId, pages])

    const fetchUserData = async(userId:string) => {
        const Ref = dbRef(getDatabase());
        try {
            const snapShot = await get(child(Ref, 'users'))
            if(snapShot.exists()){
                const allUsers = snapShot.val();
                const otherUsers = Object.entries(allUsers)
                                         .filter(([key, _]) => key !== userId)
                                         .map(([key, value]) => ({ id: key, ...(value as Omit<User, "id">) }))
                setTotalPages(Math.ceil(otherUsers.length / maxUser));
                const startIndex = (pages - 1) * maxUser;
                const endIndex = startIndex + maxUser;
                const paginateUsers = otherUsers.slice(startIndex, endIndex);
                setUsers(paginateUsers);                 
            }
        } catch(error) {
            console.log("他のユーザーデータ取得処理に失敗しました。", error)
        }
    } 

    const paginationHandler = (e:React.ChangeEvent<unknown>, value: number) => {
        setPages(value);
    }

    // デバッグ用
    useEffect(() => {
        console.log('Updated users:', users);
    }, [users]);

    return (
        <div>
            <Grid container spacing={2}>
                {users.map((user) => (
                    <Grid item xs={12} sm={6} md={4} key={user.id}>
                        <Card className="rounded-2xl">
                            <CardContent>
                                {user.photoUrl && (
                                    <img src={user.photoUrl} alt={user.nickname} className="w-full h-52 object-cover rounded-full" />
                                )}
                                <Typography variant="h6">{user.nickname}</Typography>
                                <Typography>{user.age}歳</Typography>
                                <Typography>{user.location}</Typography>
                                <SendButton userId={userId!} sendUserId={user.id} kind={1} />
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
            <Pagination 
                count={totalPages} 
                page={pages} 
                onChange={paginationHandler} 
                color="primary" 
                style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}
            />
        </div>
    )
}

export default UserList