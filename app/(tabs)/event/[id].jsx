import { useAppContext } from "@/context";
import { useCameraPermissions, CameraView } from "expo-camera";
import React, { useState, useEffect, useCallback } from "react";
import {
  Image,
  Text,
  View,
  ScrollView,
  BackHandler,
  useColorScheme,
  Pressable,
  RefreshControl,
} from "react-native";
import axios from "axios";
import { useLocalSearchParams, router, useFocusEffect } from "expo-router";
// import { useFocusEffect } from '@react-navigation/native';
import LoadingScreen from "@/components/loading";
import { Logo } from "@/assets/images/logo";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

const EventScreen = () => {
  const { IMAGE_URL, APP_URL } = useAppContext();
  const { id } = useLocalSearchParams();
  const [eventData, setEventData] = useState(null);
  const [eventParticipant, setEventParticipant] = useState(null);
  const [scanner, setScanner] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [eventId, seteventId] = useState(null);
  const [waiting, setWaiting] = useState(false);
  const [message, setMessage] = useState(null);
  const colorScheme = useColorScheme();
  const [refreshing, setRefreshing] = useState(false);
  const attendedCount = Array.isArray(eventParticipant)
    ? eventParticipant.filter((p) => p?.is_visited).length
    : 0;

  const formatDate = (value) => {
    if (!value) return "";
    const dt = new Date(value);
    if (isNaN(dt.getTime())) return String(value);
    try {
      return dt.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (_) {
      return String(value);
    }
  };

  // get data for the event (adaptable to multiple response shapes)
  const getInfoData = async () => {
    try {
      setRefreshing(true);
      const response = await axios.get(`${APP_URL}events/${id}`);
      const payload = response?.data;

      // Determine event object from common shapes
      const resolvedEvent = payload?.event
        ? payload.event
        : Array.isArray(payload)
        ? payload.find((e) => String(e?.id) === String(id))
        : payload;

      setEventData(resolvedEvent || null);
      seteventId(resolvedEvent?.id ?? null);

      // Participants may be under `participants`, fallback to empty array
      const resolvedParticipants = payload?.participants ?? [];
      setEventParticipant(Array.isArray(resolvedParticipants) ? resolvedParticipants : []);
    } catch (error) {
      console.error(error);
    } finally {
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getInfoData();
    }, [id])
  );

  // open the camera
  const toggleCamera = async () => {
    if (permission.granted) {
      setScanner(true);
    } else if (permission.denied) {
      alert(
        "You have denied camera access. Please go to your device settings to enable it."
      );
    } else {
      const result = await requestPermission();
      if (result.granted) {
        setScanner(true);
      } else {
        alert("Camera permission is required to use the scanner.");
      }
    }
  };

  // check Participant
  const checkParticipant = async (data) => {
    if (data.slice(0, 7) == '{"email') {
      if (!waiting) {
        setMessage(null);
        setWaiting(true);
        let info = JSON.parse(data);
        let code = info.code;
        let email = info.email;

        try {
          const response = await axios.put(
            APP_URL + "validate-event-invitation",
            { code, email, id, eventId }
          );
          let message = response.data.message;
          await getInfoData();

          setMessage(message);
          setTimeout(() => {
            setWaiting(false);
            setScanner(false);
          }, 1500);
        } catch (error) {
          if (error.response) {
            // Server responded with a status other than 200 range
            console.error("Error:", error.response.data.message);
          } else if (error.request) {
            // Request was made but no response received
            console.error("Network error:", error.request);
          } else {
            // Something happened in setting up the request
            console.error("Error:", error.message);
          }
        }
      }
    } else {
      setMessage("Not found");
    }
  };
  useEffect(() => {
    const handleBackPress = () => {
      if (scanner) {
        setScanner(false);
        return true;
      }
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress
    );

    return () => {
      backHandler.remove();
    };
  }, [scanner]);

  return (
    <ScrollView
      className="p-5 bg-[#f7f7f8] dark:bg-[#151718]"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={getInfoData}
          colors={["#000"]}
          tintColor={"#000"}
        />
      }
    >
      {scanner ? (
        <View className="flex-1 bg-black">
          <CameraView
            facing="back"
            onBarcodeScanned={(text) => {
              checkParticipant(text.data);
            }}
            className="absolute h-screen w-full"
          >
            <View className="h-screen w-screen" />
          </CameraView>

          {/* Overlay frame */}
          <View className="absolute inset-0 items-center justify-center">
            <View className="w-80 h-80 rounded-2xl border-2 border-white/60" />
          </View>

          {/* Close button */}
          <Pressable onPress={() => setScanner(false)} className="absolute top-14 right-5 w-10 h-10 rounded-full items-center justify-center bg-white/10">
            <Ionicons name="close" size={20} color="#fff" />
          </Pressable>

          {waiting && (
            <View className="absolute inset-0 items-center justify-center px-5 bg-black/70">
              {message ? (
                message == "Credentials match." ? (
                  <View className="flex-col items-center">
                    <Logo color={"#4ade80"} size={100} />
                    <Text className="text-2xl text-green-400">Welcome</Text>
                  </View>
                ) : message == "Already participated." ? (
                  <View className="flex-col items-center">
                    <Logo color={"#fb923c"} size={100} />
                    <Text className="text-2xl text-orange-400">Already Passed</Text>
                  </View>
                ) : message == "Participant belong to another session" ? (
                  <View className="flex-col items-center">
                    <Logo color={"#fff"} size={100} />
                    <Text className="text-2xl text-white">Participant belong to another session</Text>
                  </View>
                ) : (
                  <View className="flex-col items-center">
                    <Logo color={"#dc2626"} size={100} />
                    <Text className="text-2xl text-red-600">No such participated</Text>
                  </View>
                )
              ) : (
                <LoadingScreen />
              )}
            </View>
          )}
        </View>
      ) : (
        <>
          <View className=" w-full px-1 mt-12 flex-row items-center justify-between">
            <View>
              <Ionicons
                color={colorScheme === "dark" ? "white" : "black"}
                onPress={() => {
                  router.navigate("/");
                }}
                size={22}
                name="arrow-back"
              />
            </View>
            <Text
              className={`capitalize mt-1 ${
                colorScheme === "dark" ? "text-white" : "text-black"
              }`}
            >
              {(() => {
                const title = eventData?.name?.en ?? eventData?.name?.fr ?? eventData?.name?.ar ?? eventData?.name;
                if (!title) return "";
                return String(title).length > 20 ? String(title).slice(0, 20) + "..." : String(title);
              })()}
            </Text>
            {/* scanner */}
            <View className="">
              <Ionicons
                onPress={toggleCamera}
                color={colorScheme === "dark" ? "white" : "black"}
                size={22}
                name="qr-code-outline"
              />
            </View>
          </View>
          <View className="pt-4">
            {/* Stats cards (match session style) */}
            <View className="flex-row mt-2 mb-5 space-x-4 gap-x-4">
              <View className={`flex-1 p-4 rounded-2xl border ${colorScheme === "dark" ? "bg-white/10 border-white/10" : "bg-white/95 border-black/10 shadow-sm"}`}>
                <Text className={`text-xs uppercase tracking-wider ${colorScheme === "dark" ? "text-white/70" : "text-black/60"}`}>Participants</Text>
                <Text className={`mt-1 text-3xl font-semibold ${colorScheme === "dark" ? "text-white" : "text-black"}`}>{Array.isArray(eventParticipant) ? eventParticipant.length : 0}</Text>
              </View>
              <View className={`flex-1 p-4 rounded-2xl border ${colorScheme === "dark" ? "bg-white/10 border-white/10" : "bg-white/95 border-black/10 shadow-sm"}`}>
                <Text className={`text-xs uppercase tracking-wider ${colorScheme === "dark" ? "text-white/70" : "text-black/60"}`}>Attended</Text>
                <Text className={`mt-1 text-3xl font-semibold ${colorScheme === "dark" ? "text-white" : "text-black"}`}>{attendedCount}</Text>
              </View>
            </View>

            <Image
              className="w-full h-64 object-cover rounded-lg"
              source={{
                uri: IMAGE_URL + "/events/" + eventData?.cover,
              }}
            />
            <View
              className={`${
                colorScheme === "dark" ? "bg-slate-400/10" : "bg-white"
              } rounded-lg mt-5 `}
            >
              {eventData?.date && (
                <View className="p-3">
                  <View className="flex-row items-center">
                    <Ionicons name="calendar-outline" size={16} color={colorScheme === "dark" ? "#cfcfcf" : "#6b7280"} />
                    <Text className={`ml-2 text-xs uppercase tracking-wider ${colorScheme === "dark" ? "text-white/70" : "text-black/60"}`}>Date</Text>
                  </View>
                  <Text className={`mt-1 text-lg font-semibold ${colorScheme === "dark" ? "text-white" : "text-black"}`}>{formatDate(eventData?.date)}</Text>
                </View>
              )}
              {eventData?.location && (
                <View className="px-3 mb-3 border-t border-stone-200">
                  <View className="flex-row items-center py-3">
                    <Ionicons name="location-outline" size={16} color={colorScheme === "dark" ? "#cfcfcf" : "#6b7280"} />
                    <Text className={`ml-2 text-xs uppercase tracking-wider ${colorScheme === "dark" ? "text-white/70" : "text-black/60"}`}>Location</Text>
                  </View>
                  <Text className={`${colorScheme === "dark" ? "text-white" : "text-black"}`}>
                    {eventData?.location?.en ?? eventData?.location}
                  </Text>
                </View>
              )}
              {Array.isArray(eventParticipant) && eventParticipant.length > 0 ? (
                <View className=" border-t p-3 border-stone-200">
                  <Text
                    className={`font-medium text-xl my-3 ${
                      colorScheme === "dark" ? "text-white" : "text-black"
                    }`}
                  >
                    Participants :{" "}
                  </Text>
                  {eventParticipant.map((item, index) => (
                    <View
                      key={index}
                      className={`p-4 mb-4 border-2  rounded-lg flex-row items-center gap-2 ${
                        colorScheme === "dark"
                          ? "bg-[#c3c3c366]"
                          : "bg-gray-200"
                      } ${
                        item.is_visited
                          ? "border-green-500"
                          : "border-[#c3c3c366]"
                      }`}
                    >
                      <View className="w-10 h-10 rounded-full bg-black justify-center items-center">
                        <Text className="text-xl text-white">
                          {item.name.slice(0, 1)}
                        </Text>
                      </View>
                      <View>
                        <Text
                          className={`font-medium ${
                            colorScheme === "dark" ? "text-white" : "text-black"
                          }`}
                        >
                          {item.name}
                        </Text>
                        <Text
                          className={`text-base ${
                            colorScheme === "dark" ? "text-white" : "text-black"
                          }`}
                        >
                          {item.email}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View className="w-full flex-col pt-20 items-center justify-center ">
                  <MaterialIcons
                    name="do-not-disturb"
                    size={60}
                    color={colorScheme === "dark" ? "white" : "black"}
                  />
                  <Text className={`text-xl font-light ${colorScheme === "dark" ? "text-white" : "text-black"}`}>
                    No participant available
                  </Text>
                </View>
              )}
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
};

export default EventScreen;
