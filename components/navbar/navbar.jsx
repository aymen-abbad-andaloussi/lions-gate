import { Logo } from '@/assets/images/logo';
import React from 'react'
import { useEffect, useState } from "react";
import {
    View,
    Text,
    useColorScheme,
} from "react-native";



const Navbar = () => {
    const colorScheme = useColorScheme();
    const [greeting, setGreeting] = useState("");

    useEffect(() => {
        const currentHour = new Date().getHours();

        if (currentHour < 12) {
            setGreeting("Good Morning");
        } else if (currentHour < 18) {
            setGreeting("Good Afternoon");
        } else {
            setGreeting("Good Evening");
        }
    }, []);

    return (
        <>

        <View className=' w-full h-[10vh] mt-6 flex-row items-center justify-between'>
            <View>
                <Text className={`text-sm capitalize font-light ${colorScheme === 'dark' ? 'text-white' : 'text-black'}`}>Checkin time</Text>
                <Text className={`text-2xl capitalize mt-1 ${colorScheme === 'dark' ? 'text-white' : 'text-black'}`}>{greeting}</Text>
            </View>

            <View className='mt-4'>
                <Logo color={colorScheme === 'dark' ? "white" : "black"} />
            </View>
        </View>
        </>
    );
};

export default Navbar;
