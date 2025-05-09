import { Pressable, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useAppContext } from "@/context";
import { IconSymbol } from "../ui/IconSymbol";
import { Icon } from "@/constants";
import { useAuthContext } from "@/context/auth";

export const SignOutButton = () => {
  const { language } = useAppContext();
  const { setIsSignedIn } = useAuthContext();

  const handleSignOut = async () => {
    try {
      await AsyncStorage.setItem("token", "");
      setIsSignedIn(false);
      router.replace("/(tabs)/sign-in");
    } catch (err) {
      console.error('sign out error', err);
    }
  };

  return (
    <Pressable
      onPress={handleSignOut}
      className={`justify-between items-center my-1 ${language == "ar" ? "flex-row-reverse" : "flex-row"
        }`}
    >
      <View
        className={` items-center gap-2 ${language == "ar" ? "flex-row-reverse" : "flex-row"
          }`}
      >
        <View className="bg-[#FBFBFD] border border-[#F0F0F2] rounded-2xl p-2.5">
          <IconSymbol size={28} name="key" color={"#ef4444"} />
        </View>

        <Text className="text-red-500">Logout</Text>
      </View>

      <Icon.Arrow
        stroke={2}
        size={22}
        color={"dark"}
        rotate={language == "ar" ? 0 : 180}
      />
    </Pressable>
  );
};
