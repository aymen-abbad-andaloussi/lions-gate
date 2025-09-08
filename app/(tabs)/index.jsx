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
  RefreshControl,
} from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Ionicons, MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { useAppContext } from "@/context";
import { router } from "expo-router";

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const { infoSession, events, participants, IMAGE_URL, sessionData, refreshingSession } = useAppContext();
  const [selectedTab, setSelectedTab] = useState("Info Session");

  const tabs = [
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
        className="p-5 bg-[#f7f7f8] dark:bg-[#151718]"
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

        <View className="mt-6 px-2">
          <Text
            className={`text-xs uppercase tracking-wider font-semibold ${
              colorScheme === "dark" ? "text-white/60" : "text-black/60"
            }`}
          >
            Filter by
          </Text>
        </View>
        {/* Filter tabs */}
        <View className="flex-row justify-between mt-3">
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.name}
              onPress={() => setSelectedTab(tab.name)}
              className={`flex-1 mx-1 h-11 rounded-full flex-row items-center justify-center shadow-sm ${
                selectedTab === tab.name
                  ? colorScheme === "dark"
                    ? "bg-white"
                    : "bg-black"
                  : colorScheme === "dark"
                  ? "bg-white/10 border border-white/10"
                  : "bg-gray-100 border border-black/10"
              }`}
            >
              {tab.icon}
              <Text
                className={`ml-2 text-sm font-medium capitalize ${
                  selectedTab === tab.name
                    ? colorScheme === "dark"
                      ? "text-black"
                      : "text-white"
                    : colorScheme === "dark"
                    ? "text-white/90"
                    : "text-black/80"
                }`}
              >
                {tab.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Data display */}
        <ScrollView className="mt-6 ">
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
                      className={`p-4 mb-4 rounded-2xl border ${
                        colorScheme === "dark"
                          ? "bg-white/10 border-white/10"
                          : "bg-white/95 border-black/10 shadow-sm"
                      }`}
                    >
                      <Text
                        className={`text-lg font-semibold mb-3 ${
                          colorScheme === "dark" ? "text-white" : "text-black"
                        }`}
                        numberOfLines={1}
                      >
                        {item.name["en"]}
                      </Text>
                      <Image
                        className="w-full h-48 rounded-xl"
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
                    accessibilityRole="button"
                    activeOpacity={0.85}
                    className={`relative overflow-hidden p-4 mb-4 rounded-2xl border items-center flex-row justify-between ${
                      item.isFinish ? "opacity-60" : "opacity-100"
                    } ${
                      colorScheme === "dark"
                        ? "bg-white/10 border-white/10"
                        : "bg-white/95 border-black/10 shadow-sm"
                    }`}
                  >
                    <View
                      className={`absolute left-0 top-0 bottom-0 w-1 ${
                        item.formation == "Media" ? "bg-pink-500" : "bg-indigo-500"
                      }`}
                    />

                    <View
                      className={`mr-4 w-10 h-10 rounded-full items-center justify-center ${
                        colorScheme === "dark" ? "bg-white/10" : "bg-black/5"
                      }`}
                    >
                      <Ionicons
                        color={item.formation == "Media" ? "#ec4899" : "#6366f1"}
                        size={18}
                        name={item.formation == "Media" ? "camera" : "code-slash"}
                      />
                    </View>
                    <View className="flex-col items-start">
                      <View className="flex-row items-center">
                        <Ionicons
                          color={colorScheme === "dark" ? "#cfcfcf" : "#6b7280"}
                          size={14}
                          name="calendar-outline"
                        />
                        <Text
                          className={`ml-2 text-xs uppercase tracking-wider font-semibold ${
                            colorScheme === "dark" ? "text-white/60" : "text-black/60"
                          }`}
                        >
                          {item.start_date.slice(0, item.start_date.length - 6)}
                        </Text>
                      </View>
                      <Text
                        className={`text-lg font-semibold mt-2 ${
                          colorScheme === "dark" ? "text-white" : "text-black"
                        }`}
                        numberOfLines={2}
                      >
                        {item.name}
                      </Text>
                    </View>

                    <View className="items-end">
                      <View
                        className={`flex-row items-center px-3 py-1 rounded-full ${
                          colorScheme === "dark" ? "bg-white/10" : "bg-black/5"
                        }`}
                      >
                        <Ionicons
                          color={colorScheme === "dark" ? "white" : "black"}
                          size={16}
                          name={item.formation == "Media" ? "camera-outline" : "code-outline"}
                        />
                        <Text
                          className={`ml-2 text-xs font-medium ${
                            colorScheme === "dark" ? "text-white/90" : "text-black/80"
                          }`}
                        >
                          {item.formation}
                        </Text>
                      </View>
                      <View
                        className={`mt-3 px-2 py-0.5 rounded-full ${
                          item.isFinish
                            ? colorScheme === "dark"
                              ? "bg-white/5"
                              : "bg-black/5"
                            : colorScheme === "dark"
                            ? "bg-green-500/20"
                            : "bg-green-500/10"
                        }`}
                      >
                        <Text
                          className={`text-[10px] uppercase tracking-wider ${
                            item.isFinish
                              ? colorScheme === "dark"
                                ? "text-white/60"
                                : "text-black/60"
                              : "text-green-600"
                          }`}
                        >
                          {item.isFinish ? "Finished" : "Upcoming"}
                        </Text>
                      </View>
                      <View
                        className={`mt-3 w-8 h-8 rounded-full items-center justify-center ${
                          colorScheme === "dark" ? "bg-white/5" : "bg-black/5"
                        }`}
                      >
                        <Ionicons
                          color={colorScheme === "dark" ? "white" : "black"}
                          size={18}
                          name="chevron-forward"
                        />
                      </View>
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
