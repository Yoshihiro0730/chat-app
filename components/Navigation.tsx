import React from 'react';
import Link from 'next/link';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatIcon from '@mui/icons-material/Chat';
import SettingsTwoToneIcon from '@mui/icons-material/SettingsTwoTone';

interface NavProps {
    userId: string | null | undefined
}

interface MenuProps {
    text: string;
    icons: React.ReactNode;
    path: string;
}

const Navigation: React.FC<NavProps> = ({ userId }) => {
    const menuItems: MenuProps[] = [
        {text:'ホーム', icons:<HomeIcon />, path: '/'},
        {text:'相手からのいいね', icons:<FavoriteBorderIcon />, path: '/likes'},
        {text:'トーク', icons:<ChatIcon />, path: `/chat`},
        {text:'設定', icons:<SettingsTwoToneIcon />, path: '/setting'},
    ]
    return (
        <Box
            sx={{
                width: 250,
                backgroundColor: 'background.paper',
                borderRight: 1,
                borderColor: 'divider',
                height: '100vh',
            }}
        >
            <List>
                {menuItems.map((item) => (
                    <ListItem key={item.text} disablePadding>
                        <Link href={item.path} passHref legacyBehavior>
                            <ListItemButton component='a'>
                                <ListItemIcon>
                                    {item.icons}
                                </ListItemIcon>
                                <ListItemText primary={item.text} />
                            </ListItemButton>
                        </Link>
                    </ListItem>
                ))}
            </List>
        </Box>
    );
}

export default Navigation;