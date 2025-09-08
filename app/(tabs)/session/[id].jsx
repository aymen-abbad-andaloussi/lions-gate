import { useCameraPermissions, CameraView } from "expo-camera";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Logo } from "@/assets/images/logo";
import { useAppContext } from "@/context";
import axios from "axios";
import {
  FlatList,
  Image,
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  BackHandler,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import LoadingScreen from "@/components/loading";

export default function SessionScreen() {
  const { colorScheme, APP_URL, IMAGE_URL } = useAppContext();
  const [permission, requestPermission] = useCameraPermissions();
  const [refreshing, setRefreshing] = useState(false);
  const [attended, setAttended] = useState([]);
  const [scanner, setScanner] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [message, setMessage] = useState(null);
  const [session, setSession] = useState([]);
  const [backup, setBackup] = useState([]);
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useLocalSearchParams();

  const getInfoData = async () => {
    setLoading(true);
    setRefreshing(true);
    try {
      const response = await axios.get(`${APP_URL}session-data?id=${id}`);
      const data = response.data;
      setSessionId(data.session.id);
      setSession(data.participants);
      setBackup(data.participants);
      setAttended(data.attended);
      setTitle(`${data.session.formation} - ${data.session.name}`);
    } catch (error) {
      console.error("Error fetching session data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getInfoData();
    }, [id])
  );

  const handleSearch = (text) => {
    setSearch(text);
    if (text) {
      const result = backup.filter((e) =>
        e.full_name.toLowerCase().includes(text.toLowerCase())
      );
      setSession(result);
    } else {
      setSession(backup);
    }
  };

  const toggleCamera = async () => {
    if (permission?.granted) {
      setScanner(true);
      return;
    }
    const response = await requestPermission();
    if (response?.granted) {
      setScanner(true);
    }
  };

  const checkStudent = async (data) => {
    if (data.startsWith("{\"email")) {
      if (!waiting) {
        setMessage(null);
        setWaiting(true);
        try {
          const info = JSON.parse(data);
          const { email, code } = info;
          const response = await axios.put(`${APP_URL}validate-invitation`, {
            code,
            email,
            id,
            sessionId,
          });
          const { message, profile } = response.data;
          setMessage(message);
          await getInfoData();
          setTimeout(() => {
            setWaiting(false);
            setScanner(false);
            if (profile) {
              router.navigate(`profile/${profile.id}?session=${id}`);
            }
          }, 1500);
        } catch (error) {
          const msg = error?.response?.data?.message || "Unknown error";
          setMessage(msg);
          setWaiting(false);
        }
      }
    } else {
      setMessage("Invalid QR data");
    }
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (scanner) {
          setScanner(false);
          return true;
        }
        return false;
      }
    );
    return () => backHandler.remove();
  }, [scanner]);

  const renderItem = ({ item }) => {
    const initials = item.full_name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join(".");

    return (
      <Pressable
        onPress={() => router.navigate(`/(tabs)/profile/${item.id}?session=${id}`)}
        className="flex-1 basis-1/3 items-center mt-5"
      >
        {item.image ? (
          <Image
            className={`w-24 h-24 rounded-full border-4 ${item.is_visited ? "border-green-600" : "border-gray-500"}`}
            source={{ uri: `${IMAGE_URL}/participants/${item.image}` }}
            // defaultSource={require("@/assets/images/placeholder.png")}
            resizeMode="cover"
          />
        ) : (
          <View
            className={`w-24 h-24 items-center justify-center rounded-full border-4 ${item.is_visited ? "border-green-600" : "border-gray-500"}`}
          >
            <Text className={`text-2xl ${colorScheme === "dark" ? "text-white" : "text-black"}`}>{initials}</Text>
          </View>
        )}
      </Pressable>
    );
  };

  if (scanner) {
    return (
      <View className="flex-1 bg-black">
        {permission?.granted ? (
          <CameraView
            facing="back"
            onBarcodeScanned={({ data }) => checkStudent(data)}
            className="absolute h-screen w-screen"
          >
            <View className="h-screen w-screen" />
          </CameraView>
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text className="text-white/90 text-base">Camera permission required</Text>
            <Pressable onPress={toggleCamera} className="mt-4 px-4 py-2 bg-white/10 rounded-full">
              <Text className="text-white">Grant Permission</Text>
            </Pressable>
          </View>
        )}

        {/* Overlay UI */}
        <View className="absolute inset-0 items-center justify-center">
          <View className="w-80 h-80 rounded-2xl border-2 border-white/60" />
        </View>

        <Pressable onPress={() => setScanner(false)} className="absolute top-14 right-5 w-10 h-10 rounded-full items-center justify-center bg-white/10">
          <Ionicons name="close" size={20} color="#fff" />
        </Pressable>

        {waiting && (
          <View className="absolute inset-0 items-center justify-center bg-black/70 px-5">
            {message ? (
              <>
                <Logo color={message.includes("match") ? "#4ade80" : message.includes("Already") ? "#fb923c" : "#dc2626"} size={100} />
                <Text className={`mt-3 text-xl font-semibold ${message.includes("match") ? "text-green-400" : message.includes("Already") ? "text-orange-400" : "text-red-600"}`}>{message}</Text>
              </>
            ) : (
              <LoadingScreen />
            )}
          </View>
        )}
      </View>
    );
  }

  return (
    <ScrollView className="p-5 bg-[#f7f7f8] dark:bg-[#151718]" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={getInfoData} />}>
      <View className="flex-row justify-between items-center mt-12 px-1">
        <Ionicons name="arrow-back" size={24} color={colorScheme === "dark" ? "white" : "black"} onPress={() => router.navigate("/")} />
        <Text className={`text-base font-semibold ${colorScheme === "dark" ? "text-white" : "text-black"}`} numberOfLines={1}>{title}</Text>
        <Ionicons name="qr-code-outline" size={28} color={colorScheme === "dark" ? "white" : "black"} onPress={toggleCamera} />
      </View>

      <View className="flex-row mt-6 space-x-4 gap-x-4">
        <View className={`flex-1 p-4 rounded-2xl border ${colorScheme === "dark" ? "bg-white/10 border-white/10" : "bg-white/95 border-black/10 shadow-sm"}`}>
          <Text className={`text-xs uppercase tracking-wider ${colorScheme === "dark" ? "text-white/70" : "text-black/60"}`}>Participants</Text>
          <Text className={`mt-1 text-3xl font-semibold ${colorScheme === "dark" ? "text-white" : "text-black"}`}>{backup.length}</Text>
        </View>
        <View className={`flex-1 p-4 rounded-2xl border ${colorScheme === "dark" ? "bg-white/10 border-white/10" : "bg-white/95 border-black/10 shadow-sm"}`}>
          <Text className={`text-xs uppercase tracking-wider ${colorScheme === "dark" ? "text-white/70" : "text-black/60"}`}>Attended</Text>
          <Text className={`mt-1 text-3xl font-semibold ${colorScheme === "dark" ? "text-white" : "text-black"}`}>{attended.length}</Text>
        </View>
      </View>

      <TextInput
        placeholder="Search..."
        value={search}
        onChangeText={handleSearch}
        className={`mt-6 px-4 py-3 rounded-full border ${colorScheme === "dark" ? "bg-white/5 text-white border-white/10" : "bg-white text-black border-black/10 shadow-sm"}`}
        placeholderTextColor={colorScheme === "dark" ? "#aaa" : "#555"}
      />

      <Text className={`mt-6 text-lg font-semibold ${colorScheme === "dark" ? "text-white" : "text-black"}`}>Participants</Text>

      {loading ? (
        <View className="items-center justify-center h-60">
          <ActivityIndicator size="large" color={colorScheme === "dark" ? "white" : "black"} />
        </View>
      ) : session.length === 0 ? (
        <View className="items-center justify-center h-60">
          <Text className={`text-base ${colorScheme === "dark" ? "text-white/50" : "text-black/40"}`}>No participants found</Text>
        </View>
      ) : (
        <FlatList
          data={session.sort((a, b) => b.is_visited - a.is_visited || new Date(b.updated_at) - new Date(a.updated_at))}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          numColumns={3}
          scrollEnabled={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}
    </ScrollView>
  );
}
