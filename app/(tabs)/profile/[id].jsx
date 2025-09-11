import { useAppContext } from "@/context";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { CameraView } from "expo-camera";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Image,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  BackHandler,
  RefreshControl,
  ActivityIndicator
} from "react-native";

export default function ProfileScreen() {

  const { colorScheme, APP_URL, IMAGE_URL } = useAppContext();
  const [profile, setProfile] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [shooter, setShooter] = useState(false);
  const { id, session } = useLocalSearchParams();
  const [cameraRef, setCameraRef] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  // Request camera permission
  useEffect(() => {
    (async () => {
      const { status } = await CameraView.requestCameraPermissionsAsync?.() || { status: "granted" };
      setHasPermission(status === "granted");
    })();
  }, []);

  // Fetch profile data
  const getProfileData = async () => {
    setRefreshing(true);
    setLoading(true);
    try {
      const response = await axios.get(`${APP_URL}profile-data?id=${id}`);
      setProfile(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  // Upload photo
  const uploadPhoto = async (uri) => {
    setLoading(true);
    const formData = new FormData();
    const fileName = uri.split("/").pop();

    formData.append("photo", {
      uri,
      name: fileName,
      type: "image/jpeg",
    });
    formData.append("id", profile.id);

    try {
      const response = await axios.post(APP_URL + "session-photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProfile(response.data.profile);
      setPhoto(null);
      setShooter(false);
    } catch (error) {
      console.error("Error uploading photo:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const manualChecking = async () => {
    try {
      const response = await axios.put(APP_URL + "manual-checking", { id });
      if (response.data.status == 200) {
        await getProfileData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getProfileData();
    }, [id])
  );

  useEffect(() => {
    const handleBackPress = () => {
      if (shooter) {
        setShooter(false);
        setPhoto(null);
        return true;
      }
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress
    );

    return () => backHandler.remove();
  }, [shooter]);

  // Show loading screen while fetching initial data
  if (loading) {
    return (
      <View className={`flex-1 items-center justify-center ${colorScheme === "dark" ? "bg-black" : "bg-gray-50"}`}>
        <ActivityIndicator size="large" color={colorScheme === "dark" ? "white" : "black"} />
        <Text className={`mt-4 text-base ${colorScheme === "dark" ? "text-white" : "text-black"}`}>
          Loading profile...
        </Text>
      </View>
    );
  }

  return (
    <>
      {!shooter ? (
        <View className="p-5">
          {/* Navbar */}
          <View className='w-full px-1 h-[10vh] mt-6 flex-row items-center justify-between'>
            <View>
              <Ionicons
                onPress={() => { session ? router.navigate(`/(tabs)/session/${session}`) : router.back(); }}
                color={colorScheme === 'dark' ? "white" : "black"}
                size={22}
                name="arrow-back"
              />
            </View>
            <View>
              <Text className={`text-l capitalize ${colorScheme === 'dark' ? 'text-white' : 'text-black'}`}>
                {profile?.full_name}
              </Text>
            </View>
            <View>
              <Ionicons
                onPress={() => { router.navigate("/(tabs)"); }}
                color={colorScheme === 'dark' ? "white" : "black"}
                size={22}
                name="home"
              />
            </View>
          </View>

          {/* Profile content */}
              {/* Profile image */}
              <View className="w-40 h-40 mx-auto rounded-full">
                {profile ? (
                  profile?.image ? (
                    <TouchableOpacity onPress={() => setShooter(true)}>
                      <Image
                        className="w-full h-full rounded-full object-cover"
                        source={{ uri: IMAGE_URL + "/participants/" + profile.image }}
                      />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity onPress={() => setShooter(true)} className="w-full h-full items-center justify-center rounded-full border-4">
                      <Ionicons size={40} color={colorScheme == "dark" ? "white" : "black"} name="person-outline" />
                    </TouchableOpacity>
                  )
                ) : (
                  <View className={`w-full h-full rounded-full ${colorScheme === 'dark' ? 'bg-[#252529]' : 'bg-[#c3c3c366]'}`} />
                )}
              </View>

              {/* Info & Manual Check */}
              {profile && (
                <View className="mt-6 flex-row items-center justify-between">
                  <Text className={`font-bold mt-2 px-2 py-1 rounded-full ${colorScheme === 'dark' ? 'text-white bg-[#252529]' : 'text-black bg-[#c3c3c366]'}`}>
                    ID : #{profile?.id}
                  </Text>
                  {!profile?.is_visited && (
                    <TouchableOpacity onPress={manualChecking} className="px-5 py-2 bg-green-400 rounded-lg">
                      <Text className="font-bold">Manual Checking</Text>
                    </TouchableOpacity>
                  )}
                  <Text className={`font-bold mt-2 ${profile?.is_visited ? 'text-green-500' : 'text-gray-500'}`}>
                    {profile?.is_visited ? 'Checked In' : 'Pending'}
                  </Text>
                </View>
              )}

              {/* Scrollable info */}
              <ScrollView
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={getProfileData}
                    colors={["#000"]}
                    tintColor={"#000"}
                  />
                }
                className="h-[52vh] mt-6"
              >
                {/* Personal info */}
                <Text className={`text-lg mt-6 capitalize ${colorScheme === 'dark' ? 'text-white' : 'text-black'}`}>Personal Information</Text>
                <View className={`p-5 rounded-lg mt-6 ${colorScheme === "dark" ? "bg-[#18181b]" : "bg-[#c3c3c366]"}`}>
                  {profile && (
                    <>
                      <View className="flex-row justify-start items-center gap-x-5">
                        <Ionicons size={17} color={colorScheme == "dark" ? "#fffc" : "black"} name="person-outline" />
                        <Text className={`text-l capitalize ${colorScheme === 'dark' ? 'text-white' : 'text-black'}`}>{profile?.full_name}</Text>
                      </View>
                      <View className="flex-row justify-start mt-5 items-center gap-x-5">
                        <Ionicons size={17} color={colorScheme == "dark" ? "#fffc" : "black"} name="male-female" />
                        <Text className={`text-l capitalize ${colorScheme === 'dark' ? 'text-white' : 'text-black'}`}>{profile?.gender}</Text>
                      </View>
                      <View className="flex-row justify-start mt-5 items-center gap-x-5">
                        <Ionicons size={17} color={colorScheme == "dark" ? "#fffc" : "black"} name="calendar-outline" />
                        <Text className={`text-l capitalize ${colorScheme === 'dark' ? 'text-white' : 'text-black'}`}>{profile?.birthday} / {profile?.age} years old</Text>
                      </View>
                      <View className="flex-row justify-start mt-5 items-center gap-x-5">
                        <Ionicons size={17} color={colorScheme == "dark" ? "#fffc" : "black"} name="location-outline" />
                        <Text className={`text-l capitalize ${colorScheme === 'dark' ? 'text-white' : 'text-black'}`}>{profile?.prefecture.split("_").join(" ")}</Text>
                      </View>
                      <View className="flex-row justify-start mt-5 items-center gap-x-5">
                        <Ionicons size={17} color={colorScheme == "dark" ? "#fffc" : "black"} name="pricetag-outline" />
                        <Text className={`text-l capitalize ${profile?.current_step.split("_").join(" ").includes("fail") && "text-red-600"} ${colorScheme === 'dark' ? 'text-white' : 'text-black'}`}>
                          {profile?.current_step.split("_").join(" ")}
                        </Text>
                      </View>
                    </>
                  )}
                </View>

                {/* Contact info */}
                <Text className={`text-lg mt-6 capitalize ${colorScheme === 'dark' ? 'text-white' : 'text-black'}`}>Contact Information</Text>
                <View className={`p-5 rounded-lg mt-6 ${colorScheme === "dark" ? "bg-[#18181b]" : "bg-[#c3c3c366]"}`}>
                  {profile && (
                    <>
                      <View className="flex-row justify-start items-center gap-x-5">
                        <Ionicons size={17} color={colorScheme == "dark" ? "#fffc" : "black"} name="mail-outline" />
                        <Text className={`text-l ${colorScheme === 'dark' ? 'text-white' : 'text-black'}`}>{profile?.email}</Text>
                      </View>
                      <View className="flex-row justify-start mt-5 items-center gap-x-5">
                        <Ionicons size={17} color={colorScheme == "dark" ? "#fffc" : "black"} name="call-outline" />
                        <Text className={`text-l capitalize ${colorScheme === 'dark' ? 'text-white' : 'text-black'}`}>{profile?.phone}</Text>
                      </View>
                    </>
                  )}
                </View>

                {/* Motivation info */}
                <Text className={`text-lg mt-6 capitalize ${colorScheme === 'dark' ? 'text-white' : 'text-black'}`}>Motivation</Text>
                <View className={`p-5 rounded-lg mt-6 ${colorScheme === "dark" ? "bg-[#18181b]" : "bg-[#c3c3c366]"}`}>
                  <Text className={`leading-loose ${colorScheme === 'dark' ? 'text-white' : 'text-black'}`}>{profile?.motivation}</Text>
                </View>
              </ScrollView>
        </View>
      ) : (
        <View className="flex-1 items-center justify-center">
          {!photo ? (
            <>
              <CameraView ref={(ref) => setCameraRef(ref)}>
                <View className="h-screen w-screen" />
              </CameraView>
              <TouchableOpacity onPress={() => setShooter(false)} className="absolute top-14 right-5 w-10 h-10 rounded-full items-center justify-center bg-white/10">
                <Ionicons name="close" size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                className="absolute bottom-[10vh] px-10 py-3 rounded-lg bg-white"
                onPress={async () => {
                  if (cameraRef) {
                    const photoData = await cameraRef.takePictureAsync();
                    setPhoto(photoData.uri);
                  }
                }}
              >
                <Ionicons name="camera-outline" size={25} />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Image source={{ uri: photo }} className="h-screen w-screen" />
              <View className="absolute w-full py-4 flex-row items-center justify-center gap-x-10 bottom-[10vh]">
                <TouchableOpacity onPress={() => setPhoto(null)} className="rounded-lg px-10 py-3 bg-white">
                  <Ionicons size={25} name="reload" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => uploadPhoto(photo)} className="rounded-lg px-10 py-3 bg-white">
                  <Ionicons size={25} name="checkmark" />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      )}
    </>
  );
}
