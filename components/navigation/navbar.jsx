import { View, Text, Pressable, Image } from "react-native";
import { Feather } from "@expo/vector-icons";
import { IconSymbol } from "../ui/IconSymbol";
import { router } from "expo-router";
import { useAuthContext } from "@/context/auth";
import api from "@/api"

export default function Navbar({ title = "Screen" }) {

    const { user } = useAuthContext();

    const imageURL = api.IMAGE_URL + user.image;

    
    return (
        <View className="flex-row items-center justify-between px-6 py-4  ">
            {/* Left: Home Button */}
            <Pressable
                onPress={() => { router.push('/account') }}
            >
                <Image
                    source={{ uri: imageURL }}
                    className="w-10 h-10 rounded-full border border-gray-300"
                />
            </Pressable>

            {/* Center: Title */}
            <Text className="text-lg font-semibold text-alpha">{title}</Text>

            {/* Right: Bell + Profile */}
            <View className="flex-row items-center gap-x-4">

                {
                    title != "chat" &&
                    <Pressable onPress={() => router.push("/chat")}>
                        <IconSymbol name="message" size={22} color="#000" />
                    </Pressable>
                }

                <Pressable >
                    <Feather name="bell" size={22} color="#000" />
                </Pressable>

            </View>
        </View>
    );
}
