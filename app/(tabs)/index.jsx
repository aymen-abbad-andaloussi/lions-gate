import { Logo } from "@/assets/images/logo";

import Navbar from "@/components/navbar/navbar";

import axios from "axios";
import { useEffect, useRef, useState } from "react";
import {
  Image,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppContext } from "@/context";
import { router } from "expo-router";

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const { infoSession, events, IMAGE_URL, sessionData, refreshingSession } = useAppContext();
  const [selectedTab, setSelectedTab] = useState("Info Sessions");

  const tabs = [
    {
      name: "Info Sessions",
      icon: "information-circle-outline",
      count: infoSession?.length || 0,
    },
    {
      name: "Events",
      icon: "calendar-outline",
      count: events?.length || 0,
    },
  ];

  // Determine the data to display based on the selected tab
  const getData = () => {
    if (selectedTab === "Events") return events;
    if (selectedTab === "Info Sessions") return infoSession;
    return [];
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
              className={`flex-1 mx-1 h-11 rounded-xl flex-row items-center justify-center shadow-sm ${
                selectedTab === tab.name
                  ? "bg-[#FFC107]"
                  : "bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)]"
              }`}
            >
              <Ionicons name={tab.icon} size={18} color={selectedTab === tab.name ? "black" : "white"} />
              <Text
                className={`ml-2 text-sm font-medium capitalize ${selectedTab === tab.name ? "text-black" : "text-white/90"}`}
              >
                {tab.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Data display */}
        <ScrollView className="mt-6 ">
          {selectedTab == "Events" ? (
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
                      className={`p-4 mb-4 rounded-2xl border bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.08)]`}
                    >
                      <Text className={`text-lg font-semibold mb-3 text-white`} numberOfLines={1}>
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
          ) : selectedTab == "Info Sessions" ? (
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
                    } bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.08)]`}
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
                      <Text className={`text-lg font-semibold mt-2 text-white`} numberOfLines={2}>
                        {item.name}
                      </Text>
                    </View>

                    <View className="items-end">
                      <View className={`flex-row items-center px-3 py-1 rounded-full bg-white/10`}>
                        <Ionicons color={'white'} size={16} name={item.formation == "Media" ? "camera-outline" : "code-outline"} />
                        <Text className={`ml-2 text-xs font-medium text-white/90`}>{item.formation}</Text>
                      </View>
                      <View
                        className={`mt-3 px-2 py-0.5 rounded-full ${item.isFinish ? "bg-white/5" : "bg-green-500/20"}`}
                      >
                      <Text
                          className={`text-[10px] uppercase tracking-wider ${item.isFinish ? "text-white/60" : "text-green-600"}`}
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
