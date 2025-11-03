import { Logo } from '@/assets/images/logo';
import React from 'react'
import { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from "@/hooks/useColorScheme";



const Navbar = ({ query = '', onChangeQuery = () => {}, onSubmitQuery = () => {}, onOpenFilters = () => {} }) => {
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
        <View className='w-full mt-6'>
            <View className='flex-row items-center justify-between'>
                <View>
                    <Text className='text-xs font-medium text-text-secondary dark:text-text-inverted/70'>Check-in</Text>
                    <Text className='text-2xl font-semibold text-text-primary dark:text-text-inverted mt-1'>{greeting}</Text>
                </View>

                <View className='mt-2'>
                    <Logo color={colorScheme === 'dark' ? 'white' : 'black'} />
                </View>
            </View>

            <View className='mt-4 flex-row items-center gap-2'>
                <View className='flex-1 flex-row items-center bg-white dark:bg-surface-muted border border-black/5 dark:border-white/10 rounded-lg px-3 py-2'>
                    <Ionicons name='search' size={16} color={colorScheme === 'dark' ? '#9BA1A6' : '#687076'} />
                    <TextInput
                        placeholder='Search sessions, events, people...'
                        placeholderTextColor={colorScheme === 'dark' ? '#9BA1A6' : '#687076'}
                        className='ml-2 text-sm text-text-primary dark:text-text-inverted flex-1'
                        value={query}
                        onChangeText={onChangeQuery}
                        onSubmitEditing={onSubmitQuery}
                    />
                </View>

                <TouchableOpacity className='bg-brand rounded-lg px-3 py-2 active:opacity-90' onPress={onOpenFilters}>
                    <Ionicons name='options' size={18} color={'#111111'} />
                </TouchableOpacity>
            </View>
        </View>
        </>
    );
};

export default Navbar;
