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

  // get data for the event
  const getInfoData = async () => {
    try {
      setRefreshing(true);
      const response = await axios.get(`${APP_URL}events/${id}`);
      const dataEvent = await response.data.event;
      setEventData(dataEvent);
      const dataParticipant = await response.data.participants;
      seteventId(eventData?.id);
      setEventParticipant(dataParticipant);
      setRefreshing(false);
    } catch (error) {
      console.error(error);
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
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={getInfoData}
          colors={["#000"]}
          tintColor={"#000"}
        />
      }
    >
      <View className=" w-full px-1 h-[10vh] mt-6 flex-row items-center justify-between">
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
          {eventData?.name["en"].length > 20
            ? eventData?.name["en"].slice(0, 20) + "..."
            : eventData?.name["en"]}
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
      {scanner ? (
        <View className="h-screen bg-black/80 items-center justify-center">
          <View className="w-96 h-96 border border-white rounded-lg">
            <CameraView
              facing="back"
              onBarcodeScanned={(text) => {
                checkParticipant(text.data);
              }}
            >
              <View className="w-full h-full "></View>
            </CameraView>
          </View>
          {waiting && (
            <View className="w-full h-screen items-center justify-center px-5 absolute top-0  bg-black/70">
              {message ? (
                message == "Credentials match." ? (
                  <View className="flex-col items-center">
                    <Logo color={"#4ade80"} size={100} />
                    <Text className="text-2xl text-green-400">Welcome</Text>
                  </View>
                ) : message == "Already participated." ? (
                  <View className="flex-col items-center">
                    <Logo color={"#fb923c"} size={100} />
                    <Text className="text-2xl text-orange-400">
                      Already Passed
                    </Text>
                  </View>
                ) : message == "Participant belong to another session" ? (
                  <View className="flex-col items-center">
                    <Logo color={"#fff"} size={100} />
                    <Text className="text-2xl text-white">
                      Participant belong to another session
                    </Text>
                  </View>
                ) : (
                  <View className="flex-col items-center">
                    <Logo color={"#dc2626"} size={100} />
                    <Text className="text-2xl text-red-600">
                      No such participated
                    </Text>
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
          <View className="px-5">
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
              <View className="mb-3 p-3">
                <Text
                  className={`text-xl font-medium py-3 ${
                    colorScheme === "dark" ? "text-white" : "text-black"
                  }`}
                >
                  Location :{" "}
                </Text>
                <Text
                  className={` ${
                    colorScheme === "dark" ? "text-white" : "text-black"
                  }`}
                >
                  {eventData?.location["en"]}
                </Text>
              </View>
              <View className="px-3 mb-3 border-t border-stone-200">
                <Text
                  className={`text-xl font-medium py-3 ${
                    colorScheme === "dark" ? "text-white" : "text-black"
                  } `}
                >
                  Description :{" "}
                </Text>
                <Text
                  className={`${
                    colorScheme === "dark" ? "text-white" : "text-black"
                  }`}
                >
                  {eventData?.description["en"]}
                </Text>
              </View>
              {eventParticipant?.length > 0 ? (
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
                    color={"black"}
                  />
                  <Text className={`text-xl  font-light `}>
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
