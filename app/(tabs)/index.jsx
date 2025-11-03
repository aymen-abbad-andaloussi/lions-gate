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
  const { infoSession, events, IMAGE_URL, sessionData, refreshingSession, APP_URL, Token } = useAppContext();
  const [selectedTab, setSelectedTab] = useState("Info Sessions");
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({ formation: "all", status: "all", privacy: "all" });
  const [peopleResults, setPeopleResults] = useState([]);
  const [loadingPeople, setLoadingPeople] = useState(false);
  const [showFilters, setShowFilters] = useState(false);


  console.log(selectedTab);

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

  // Determine the data to display based on the selected tab + filters + query
  const getData = () => {
    const base = selectedTab === "Events" ? (events || []) : (infoSession || []);
    let filtered = base;

    if (selectedTab === 'Info Sessions') {
      // Always allow switching between formations from header tabs or future controls
      filtered = filters.formation === 'all' ? base : base.filter((i) => (i.formation || '').toLowerCase() === filters.formation);
      // Only apply status filter when formation is coding
      if (filters.formation === 'coding') {
        filtered = filters.status === 'all' ? filtered : filtered.filter((i) => filters.status === 'finished' ? i.isFinish : !i.isFinish);
      }
    } else if (selectedTab === 'Events') {
      if (filters.privacy !== 'all') {
        const wantPrivate = filters.privacy === 'private';
        filtered = filtered.filter((i) => Boolean(i?.is_private) === wantPrivate);
      }
    }

    const byQuery = query.trim().length === 0 ? filtered : filtered.filter((i) => {
      const name = typeof i.name === 'string' ? i.name : (i.name?.en || i.name?.fr || i.name?.ar || '');
      return String(name).toLowerCase().includes(query.toLowerCase());
    });
    return byQuery;
  };

  const searchPeople = async () => {
    if (!query.trim()) {
      setPeopleResults([]);
      return;
    }
    try {
      setLoadingPeople(true);
      const url = `${APP_URL}search/participants?q=${encodeURIComponent(query)}`;
      const response = await axios.get(url, { headers: { Authorization: `Bearer ${Token}` } });
      const list = Array.isArray(response.data) ? response.data : (response.data?.participants || []);
      setPeopleResults(list);
    } catch (e) {
      setPeopleResults([]);
    } finally {
      setLoadingPeople(false);
    }
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
        className="p-5 bg-white dark:bg-surface-muted"
        refreshControl={
          <RefreshControl
            refreshing={refreshingSession}
            onRefresh={sessionData}
            colors={["#000"]}
            tintColor={"#000"}
          />
        }
      >
        <Navbar
          query={query}
          onChangeQuery={setQuery}
          onSubmitQuery={searchPeople}
          onOpenFilters={() => {
            // Open compact modal only where relevant
            if (selectedTab === 'Events' || (selectedTab === 'Info Sessions' && filters.formation === 'coding')) {
              setShowFilters(true);
            }
          }}
        />

        <View className="mt-6 px-2">
          <Text
            className={`text-xs uppercase tracking-wider font-semibold ${colorScheme === "dark" ? "text-white/60" : "text-black/60"
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
              className={`flex-1 mx-1 h-11 rounded-lg flex-row items-center justify-center shadow-sm ${selectedTab === tab.name
                ? "bg-brand"
                : "bg-white/5 border border-white/10"
                }`}
            >
              <Ionicons name={tab.icon} size={18} color={selectedTab === tab.name ? "#111111" : "white"} />
              <Text
                className={`ml-2 text-sm font-medium capitalize ${selectedTab === tab.name ? "text-[#111111]" : "text-white/90"}`}
              >
                {tab.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>



        {/* Compact filter modal (only opens in Coding sessions or Events) */}
        {showFilters && (
          <View className="absolute -left-5 top-0 z-50 h-screen items-center justify-center w-screen">
            <TouchableOpacity activeOpacity={1} className="absolute -top-full left-0 right-0 bottom-0 bg-black/50" onPress={() => setShowFilters(false)} />
            <View className="w-full px-4 pb-6">
              <View className="w-full rounded-lg bg-white dark:bg-surface-muted border border-black/5 dark:border-white/10 p-4 shadow-lg">
                {selectedTab === 'Info Sessions' && (
                  <View className="mb-4">
                    <Text className={`text-xs uppercase tracking-wider font-semibold ${colorScheme === 'dark' ? 'text-white/70' : 'text-black/60'}`}>Formation</Text>
                    <View className="mt-2">
                      {[
                        { label: 'All', value: 'all' },
                        { label: 'Coding', value: 'coding' },
                        { label: 'Media', value: 'media' },
                      ].map((opt) => (
                        <TouchableOpacity key={`formation-${opt.value}`} className={`flex-row items-center justify-between px-3 py-3 rounded-lg mt-2 ${filters.formation === opt.value ? 'bg-brand' : 'bg-black/5 dark:bg-white/5'}`} onPress={() => setFilters((f) => ({ ...f, formation: opt.value }))}>
                          <Text className={`${filters.formation === opt.value ? 'text-[#111111]' : colorScheme === 'dark' ? 'text-white' : 'text-black'}`}>{opt.label}</Text>
                          {filters.formation === opt.value && <Ionicons name="checkmark" size={16} color="#111111" />}
                        </TouchableOpacity>
                      ))}
                    </View>
                    <Text className={`text-xs uppercase tracking-wider font-semibold ${colorScheme === 'dark' ? 'text-white/70' : 'text-black/60'}`}>Status</Text>
                    <View className="mt-2">
                      {[
                        { label: 'Any', value: 'all' },
                        { label: 'Upcoming', value: 'upcoming' },
                        { label: 'Finished', value: 'finished' },
                      ].map((opt) => (
                        <TouchableOpacity key={opt.value} className={`flex-row items-center justify-between px-3 py-3 rounded-lg mt-2 ${filters.status === opt.value ? 'bg-brand' : 'bg-black/5 dark:bg-white/5'}`} onPress={() => setFilters((f) => ({ ...f, status: opt.value }))}>
                          <Text className={`${filters.status === opt.value ? 'text-[#111111]' : colorScheme === 'dark' ? 'text-white' : 'text-black'}`}>{opt.label}</Text>
                          {filters.status === opt.value && <Ionicons name="checkmark" size={16} color="#111111" />}
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {selectedTab === 'Events' && (
                  <View>
                    <Text className={`text-xs uppercase tracking-wider font-semibold ${colorScheme === 'dark' ? 'text-white/70' : 'text-black/60'}`}>Privacy</Text>
                    <View className="mt-2">
                      {[
                        { label: 'All', value: 'all' },
                        { label: 'Private', value: 'private' },
                        { label: 'Public', value: 'public' },
                      ].map((opt) => (
                        <TouchableOpacity key={opt.value} className={`flex-row items-center justify-between px-3 py-3 rounded-lg mt-2 ${filters.privacy === opt.value ? 'bg-brand' : 'bg-black/5 dark:bg-white/5'}`} onPress={() => setFilters((f) => ({ ...f, privacy: opt.value }))}>
                          <Text className={`${filters.privacy === opt.value ? 'text-[#111111]' : colorScheme === 'dark' ? 'text-white' : 'text-black'}`}>{opt.label}</Text>
                          {filters.privacy === opt.value && <Ionicons name="checkmark" size={16} color="#111111" />}
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
                <View className="mt-4 flex-row">
                  <TouchableOpacity className="flex-1 bg-brand rounded-lg items-center py-3" onPress={() => setShowFilters(false)}>
                    <Text className="text-[#111111] font-semibold">Apply</Text>
                  </TouchableOpacity>
                  <View className="w-3" />
                  <TouchableOpacity className="px-4 rounded-lg items-center justify-center border border-white/15" onPress={() => { setFilters({ formation: 'all', status: 'all', privacy: 'all' }); setShowFilters(false); }}>
                    <Text className={`${colorScheme === 'dark' ? 'text-white/80' : 'text-black/70'}`}>Reset</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Data display */}
        <ScrollView className="mt-6 ">
          {/* People search results */}
          {query.trim().length > 0 && (
            <View className="mb-4">
              <Text className={`text-xs uppercase tracking-wider font-semibold ${colorScheme === 'dark' ? 'text-white/60' : 'text-black/60'}`}>People</Text>
              {loadingPeople ? (
                <View className="flex-row items-center mt-2">
                  <ActivityIndicator size="small" color={colorScheme === 'dark' ? 'white' : 'black'} />
                  <Text className={`ml-2 ${colorScheme === 'dark' ? 'text-white' : 'text-black'}`}>Searching...</Text>
                </View>
              ) : peopleResults.length === 0 ? (
                <Text className={`${colorScheme === 'dark' ? 'text-white/50' : 'text-black/40'} mt-2`}>No people found</Text>
              ) : (
                <View className="mt-2">
                  {peopleResults.slice(0, 6).map((p, idx) => (
                    <TouchableOpacity key={idx} className="flex-row items-center p-3 rounded-lg bg-white/5 border border-white/10 mb-2" onPress={() => router.navigate(`/(tabs)/profile/${p.id}`)}>
                      <View className="w-8 h-8 rounded-full bg-white/10 items-center justify-center">
                        <Text className="text-white text-xs">{String(p.full_name || p.name || '').slice(0, 1)}</Text>
                      </View>
                      <Text className="ml-3 text-white">{p.full_name || p.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}
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
                    <View className={`p-4 mb-4 rounded-lg border ${item.is_private ? 'border-amber-400/30 bg-amber-400/10' : 'border-white/10 bg-white/5'}`}>
                      <View className="flex-row items-center justify-between mb-3">
                        <Text className={`text-lg font-semibold ${colorScheme === 'dark' ? 'text-white' : 'text-black'}`} numberOfLines={1}>
                          {item.name?.en || item.name}
                        </Text>
                        {item.is_private && (
                          <View className="px-2 py-0.5 rounded-lg bg-amber-400/20 border border-amber-400/30">
                            <Text className="text-[10px] text-amber-300">Private</Text>
                          </View>
                        )}
                      </View>
                      <Image className="w-full h-48 rounded-lg" source={{ uri: IMAGE_URL + "/events/" + item.cover }} />
                      <View className="mt-3 flex-row items-center">
                        <Ionicons name="location-outline" size={14} color={colorScheme === 'dark' ? '#cfcfcf' : '#6b7280'} />
                        <Text className={`ml-1 text-xs ${colorScheme === 'dark' ? 'text-white/70' : 'text-black/60'}`}>{typeof item.location === 'string' ? item.location : (item.location?.en || item.location?.fr || item.location?.ar)}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View className="w-full h-[70vh]  items-center justify-center ">
                <Text>
                  <Text
                    className={`text-xl  font-light ${colorScheme === "dark" ? "text-white" : "text-black/20"
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
                    activeOpacity={0.9}
                    className={`
        relative overflow-hidden p-5 mb-5 rounded-2xl 
        border shadow-sm 
        flex-row justify-between items-start
        ${item.isFinish ? "opacity-70" : "opacity-100"}
        ${item.formation == "Media"
                        ? "bg-gradient-to-r from-indigo-500/10 via-indigo-400/5 to-indigo-500/10 border-indigo-400/20"
                        : "bg-gradient-to-r from-brand/10 via-brand/5 to-brand/10 border-brand/20"}
      `}
                  >
                    {/* Left Side */}
                    <View className="flex-1 pr-3">
                      {/* Formation Badge */}
                      <View className="flex-row items-center">
                        <View
                          className={`w-2.5 h-2.5 rounded-full ${item.formation == "Media" ? "bg-indigo-500" : "bg-brand"
                            }`}
                        />
                        <Text
                          className={`ml-2 text-[11px] font-medium uppercase tracking-wider 
            rounded-full px-2 py-0.5 
            ${item.formation == "Media"
                              ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-300"
                              : "bg-brand/10 text-brand dark:text-brand"}`}
                        >
                          {item.formation}
                        </Text>
                        {item.is_private && (
                          <View className="flex-row">

                            <Ionicons name="lock-closed" color={"white"} />
                            <Text className="ml-2 text-[10px] text-white/80 font-medium">
                              • Private
                            </Text>
                          </View>
                        )}
                      </View>

                      {/* Title */}
                      <Text
                        className={`mt-3 text-lg font-semibold leading-snug 
          ${colorScheme === "dark" ? "text-white" : "text-gray-900"}`}
                        numberOfLines={2}
                      >
                        {typeof item.name === "string"
                          ? item.name
                          : item.name?.en || item.name?.fr || item.name?.ar}
                      </Text>

                      {/* Date + Places */}
                      <View className="mt-3 flex-row items-center">
                        <Ionicons
                          name="calendar-outline"
                          size={14}
                          color={colorScheme === "dark" ? "#cfcfcf" : "#6b7280"}
                        />
                        <Text
                          className={`ml-1 text-xs ${colorScheme === "dark"
                            ? "text-white/60"
                            : "text-gray-600"
                            }`}
                        >
                          {item.start_date?.slice(
                            0,
                            (item.start_date || "").length - 6
                          )}
                        </Text>
                        {typeof item.places === "number" && (
                          <Text
                            className={`ml-3 text-xs ${colorScheme === "dark"
                              ? "text-white/60"
                              : "text-gray-600"
                              }`}
                          >
                            {item.places} places
                          </Text>
                        )}
                      </View>
                    </View>

                    {/* Right Side */}
                    <View className="items-center justify-between">
                      <View
                        className={`w-14 h-14 rounded-2xl items-center justify-center shadow-sm
          ${item.formation == "Media" ? "bg-indigo-500/20" : "bg-brand/30"}`}
                      >
                        <Ionicons
                          color={item.formation == "Media" ? "#6366f1" : "#FDBB10"}
                          size={22}
                          name={item.formation == "Media" ? "camera" : "code-slash"}
                        />
                      </View>
                      <Text
                        className={`mt-3 text-[11px] font-medium tracking-wide 
          ${item.isFinish ? "text-gray-400" : "text-green-500"}`}
                      >
                        {item.isFinish ? "Finished" : "Upcoming"}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

            ) : (
              <View className="w-full h-[70vh]  items-center justify-center ">
                <Text>
                  <Text
                    className={`text-xl  font-light ${colorScheme === "dark" ? "text-white" : "text-black/20"
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
