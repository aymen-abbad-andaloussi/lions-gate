import { Logo } from "@/assets/images/logo";
import LoadingScreen from "@/components/loading";
import Navbar from "@/components/navbar/navbar";

import axios from "axios";
import { useEffect, useRef, useState } from "react";
import {
  Image,
  View,
  Text,
  Platform,
  ScrollView,
  Pressable,
  ImageBackground,
  Dimensions,
  TextInput,
  TouchableOpacity,
  BackHandler,
  useColorScheme,
  RefreshControl,
} from "react-native";
import { Ionicons, MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { useAppContext } from "@/context";
import { router } from "expo-router";

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const { infoSession, events, participants, IMAGE_URL, sessionData, refreshingSession } = useAppContext();
  const [selectedTab, setSelectedTab] = useState("Event");

  const tabs = [
    {
      name: "Event",
      icon: (
        <MaterialIcons
          name="event"
          size={20}
          color={
            selectedTab === "Event"
              ? colorScheme === "dark"
                ? "black"
                : "white"
              : colorScheme === "dark"
              ? "white"
              : "black"
          }
        />
      ),
    },
    {
      name: "Info Session",
      icon: (
        <Ionicons
          name="information-circle-outline"
          size={20}
          color={
            selectedTab === "Info Session"
              ? colorScheme === "dark"
                ? "black"
                : "white"
              : colorScheme === "dark"
              ? "white"
              : "black"
          }
        />
      ),
    },
    // {
    //   name: "Participant",
    //   icon: <FontAwesome name="users" size={20} color={selectedTab === "Participant" ? (colorScheme === 'dark' ? "black" : "white") : (colorScheme === 'dark' ? "white" : "black")} />
    // },
  ];

  // Determine the data to display based on the selected tab
  const getData = () => {
    if (selectedTab === "Event") return events;
    if (selectedTab === "Info Session") return infoSession;
    if (selectedTab === "Participant") return participants;
    return null;
  };

  // useEffect(() => {
  //   console.log(getData());
  //   setTimeout(() => {
  //     router.navigate("/(tabs)/profile/3")

  //   }, 2000);

  // }, [selectedTab])

  return (
    <>
      <ScrollView
        className="p-5"
        refreshControl={
          <RefreshControl
            refreshing={refreshingSession}
            onRefresh={sessionData}
            colors={["#000"]}
            tintColor={"#000"}
          />
        }
      >
        <Navbar />

        <Text
          className={`text-sm ml-2 mt-6 capitalize font-light ${
            colorScheme === "dark" ? "text-white" : "text-black"
          }`}
        >
          Filter by :
        </Text>
        {/* Filter tabs */}
        <View className="flex-row justify-between mt-6">
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.name}
              onPress={() => setSelectedTab(tab.name)}
              className={`flex-1 mx-1 h-10 rounded-lg flex-row items-center justify-center ${
                selectedTab === tab.name
                  ? colorScheme === "dark"
                    ? "bg-white"
                    : "bg-black"
                  : colorScheme === "dark"
                  ? "bg-[#c3c3c366]"
                  : "bg-gray-300"
              }`}
            >
              {tab.icon}
              <Text
                className={`ml-2 text-sm capitalize ${
                  selectedTab === tab.name
                    ? colorScheme === "dark"
                      ? "text-black"
                      : "text-white"
                    : colorScheme === "dark"
                    ? "text-white"
                    : "text-black"
                }`}
              >
                {tab.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Data display */}
        <ScrollView className="mt-6 h-[62vh]">
          {selectedTab == "Event" ? (
            getData() ? (
              <View>
                {getData().map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      router.navigate(`/(tabs)/event/${item.id}`);
                    }}
                  >
                    <View
                      className={`p-4 mb-4 rounded-lg ${
                        colorScheme === "dark"
                          ? "bg-[#c3c3c366]"
                          : "bg-gray-200"
                      }`}
                    >
                      <Text
                        className={`text-xl font-medium mb-2 ${
                          colorScheme === "dark" ? "text-white" : "text-black"
                        }`}
                      >
                        {item.name["en"]}
                      </Text>
                      <Image
                        className="w-full h-52 rounded"
                        source={{
                          uri: IMAGE_URL + "/events/" + item.cover,
                        }}
                      />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View className="w-full h-[70vh]  items-center justify-center ">
                <Text>
                  <Text
                    className={`text-xl  font-light ${
                      colorScheme === "dark" ? "text-white" : "text-black/20"
                    }`}
                  >
                    No event available
                  </Text>
                </Text>
              </View>
            )
          ) : selectedTab == "Info Session" ? (
            getData() ? (
              <View>
                {getData().map((item, index) => (
                  <TouchableOpacity
                    onPress={() => {
                      router.navigate(`/(tabs)/session/${item.id}`);
                    }}
                    key={index}
                    className={`p-4  items-center flex-row justify-between mb-4 rounded-lg border-2 border-black/50 ${
                      item.isFinish ? "opacity-40" : "opacity-100"
                    } ${
                      colorScheme === "dark" ? "bg-[#c3c3c366]" : "bg-gray-200"
                    }`}
                  >
                    <View className="flex-col items-start">
                      <Text
                        className={`text-base ${
                          colorScheme === "dark" ? "text-white" : "text-black"
                        }`}
                      >
                        {item.start_date.slice(0, item.start_date.length - 6)}
                      </Text>
                      <Text
                        className={`text-xl mt-6 ${
                          colorScheme === "dark" ? "text-white" : "text-black"
                        }`}
                      >
                        {item.name}
                      </Text>
                    </View>

                    <View className="flex-col items-center">
                      <Text
                        className={`text-base ${
                          colorScheme === "dark" ? "text-white" : "text-black"
                        }`}
                      >
                        {item.formation}
                      </Text>
                      {/* <Text className={`text-xl mt-6 ${colorScheme === 'dark' ? 'text-white' : 'text-black'}`}>
                            {item.name}
                          </Text> */}
                      <Ionicons
                        color={colorScheme === "dark" ? "white" : "black"}
                        className="mt-6"
                        size={20}
                        name={
                          item.formation == "Media" ? "camera-outline" : "code"
                        }
                      />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View className="w-full h-[70vh]  items-center justify-center ">
                <Text>
                  <Text
                    className={`text-xl  font-light ${
                      colorScheme === "dark" ? "text-white" : "text-black/20"
                    }`}
                  >
                    No Info Session available
                  </Text>
                </Text>
              </View>
            )
          ) : (
            <View></View>
          )}
        </ScrollView>
      </ScrollView>
    </>
  );
}
