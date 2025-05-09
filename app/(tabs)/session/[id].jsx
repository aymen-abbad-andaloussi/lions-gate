import { useCameraPermissions, CameraView } from "expo-camera";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Logo } from "@/assets/images/logo";
import { useAppContext } from "@/context";
import axios from "axios";
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
  BackHandler,
  RefreshControl,
} from "react-native";
import LoadingScreen from "@/components/loading";

export default function SessionScreen() {

  const { colorScheme, infoSession, APP_URL, IMAGE_URL } = useAppContext()
  const [permission, requestPermission] = useCameraPermissions();
  const [refreshing, setRefreshing] = useState(false);
  const [attended, setAttended] = useState(null);
  const [scanner, setScanner] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [message, setMessage] = useState(null);
  const [session, setSession] = useState(null)
  const [backup, setBackup] = useState(null)
  const [search, setSearch] = useState(null)
  const [title, setTitle] = useState(false);
  const [sessionId, setSessionId] = useState(null)
  const { id } = useLocalSearchParams()

  // get data related to that  info session
  const getInfoData = async () => {
    setSession(null)
    setRefreshing(true)
    setAttended(null)
    setTitle(null)
    const response = await axios.get(APP_URL + "session-data" + `?id=${id}`)
    let data = await response.data
    console.log(data);
    setSessionId(data.session.id)
    setSession(data.participants);
    setAttended(data.attended);
    setTitle(data.session.formation + " - " + data.session.name);
    setBackup(data.participants);
    setRefreshing(false)
  }
  useFocusEffect(
    useCallback(() => {
      getInfoData();

    }, [id])
  );


  // ToDo : search
  const handleSearch = (text) => {
    setSearch(text)
    if (text) {
      let result = backup?.filter(e => e.full_name.toLowerCase().includes(text.toLowerCase()))
      setSession(result);
    } else {
      setSession(backup)
    }

  }


  // open the camera
  const toggleCamera = () => {
    if (!permission.granted) {
      requestPermission()
    } else {
      setScanner(true)
    }
  }

  // check student
  const checkStudent = async (data) => {

    if (data.slice(0,7) == '{"email') {      
      if (!waiting) {
        setMessage(null)
        setWaiting(true)
        console.log(data);
  
        let info = JSON.parse(data)
        let code = info.code
        let email = info.email
        
        
        try {
          const response = await axios.put(APP_URL + "validate-invitation", { code, email , id, sessionId })
          let message = response.data.message;
          let profile = response.data.profile;
          console.log(profile);
          await getInfoData()
  
          setMessage(message)
          setTimeout(() => {
            setWaiting(false)
            setScanner(false)
            if (profile) {
              router.navigate(`profile/${profile?.id}?session=${id}`)
            }
          }, 1500);
        } catch (error) {
          if (error.response) {
            // Server responded with a status other than 200 range
            console.error('Error:', error.response.data.message);
          } else if (error.request) {
            // Request was made but no response received
            console.error('Network error:', error.request);
          } else {
            // Something happened in setting up the request
            console.error('Error:', error.message);
          }
        }
  
      }
    }else{

      setMessage("Not found")
    }

  }

  useEffect(() => {
    const handleBackPress = () => {
      if (scanner) {
        setScanner(false);
        return true;
      }
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress
    );

    return () => {
      backHandler.remove();
    };
  }, [scanner]);



  return (
    <>
      {
        !scanner ?
          <View className="p-5">
            {/* navbar */}
            <View className=' w-full px-1 h-[10vh] mt-6 flex-row items-center justify-between'>
              <View>
                <Ionicons color={colorScheme === 'dark' ? "white" : "black"} onPress={() => { router.navigate("/") }} size={22} name="arrow-back" />
              </View>
              <Text className={`capitalize mt-1 ${colorScheme === 'dark' ? 'text-white' : 'text-black'}`}>{title} </Text>
              {/* scanner */}
              <View className=''>
                <Ionicons onPress={toggleCamera} color={colorScheme === 'dark' ? "white" : "black"} size={22} name="qr-code-outline" />
              </View>
            </View>

            {/* statistics */}
            <View className=" items-center flex-row  ">
              <View className={` px-3 flex-row  justify-between  ${colorScheme === 'dark' ? 'bg-[#c3c3c366] text-white' : 'bg-gray-200 text-black'} h-24 rounded-lg w-[48%]`}>
                <Text className={` capitalize mt-1 ${colorScheme === 'dark' ? 'text-white' : 'text-black'}`}>Participants :</Text>
                <Text className={`text-3xl capitalize self-center mt-1 ${colorScheme === 'dark' ? 'text-white' : 'text-black'}`}>{backup?.length}</Text>
              </View>

              <View className={` px-3 flex-row  justify-between ${colorScheme === 'dark' ? 'bg-[#c3c3c366] text-white' : 'bg-gray-200 text-black'} h-24 rounded-lg w-[48%] ml-2`}>
                <Text className={` capitalize mt-1 ${colorScheme === 'dark' ? 'text-white' : 'text-black'}`}>Attends :</Text>
                <Text className={`text-3xl capitalize self-center mt-1 ${colorScheme === 'dark' ? 'text-white' : 'text-black'}`}>{attended?.length}</Text>
              </View>

            </View>

            {/* Search bar */}
            <View className="relative mt-4">
              <TextInput
                onChangeText={(text) => handleSearch(text)}
                className={`w-full h-12 rounded-lg px-3 pr-10 ${colorScheme === 'dark' ? 'bg-[#c3c3c366] text-white' : 'bg-gray-200 text-black'}`}
                placeholder="Search.."
                placeholderTextColor={colorScheme === 'dark' ? "lightgray" : "darkhgray"}
              />
              <View className="absolute right-3 top-3">
                <Ionicons
                  name="search-outline"
                  size={24}
                  color={colorScheme === 'dark' ? "white" : "black"}
                />
              </View>
            </View>

            <Text className={`text-lg capitalize  mt-6 ${colorScheme === 'dark' ? 'text-white' : 'text-black'}`}>Participants : </Text>


            {/* people */}
            <ScrollView
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={getInfoData}
                  colors={["#000"]}
                  tintColor={"#000"}
                />
              }
              className="mt-6  h-[60vh]">
              {
                session ?
                  <>
                    {
                      session.length > 0 ?

                        <View className="flex-row flex-wrap justify-between ">
                          {

                            session?.sort((a, b) => {
                              // ratbt l array flwel 3la 7sab chkon li  deja dazo f session  bach   ytl3o homa lwlin
                              if (b.is_visited !== a.is_visited) {
                                return b.is_visited - a.is_visited;
                              }
                              // o hna ratbthom 3la  7asab li jdid   iban howa  lwel   3la 7asab akhir wa7d checkinah o akhir wa7d t9ayed   f session
                              return new Date(b.updated_at) - new Date(a.updated_at);
                            }).map((element, index) =>
                              
                              
                                <Pressable
                                  onPress={() => { router.navigate(`/(tabs)/profile/${element.id}?session=${id}`) }}
                                  key={index} className={`flex-col items-center justify-center mt-5`}>
                                  {
                                    element.image ?
                                      <Image
                                        className={`w-[14vh] h-[14vh] rounded-full object-cover border-4 ${element.is_visited ? "border-green-600" : "border-gray-500"}`}
                                        source={{ uri: IMAGE_URL + "/participants/" + element.image }}
                                      />
                                      :
                                      <>
                                        <View className={`w-[14vh] h-[14vh]  items-center justify-center rounded-full object-cover border-4 ${element.is_visited ? "border-green-600" : "border-gray-500"}`}>
                                          {/* <Logo size={30} color={colorScheme === 'dark' ? 'white' : 'black'} /> */}

                                  <Text className={` capitalize text-2xl  mt-2 ${colorScheme === 'dark' ? 'text-white' : 'text-black'}`}>{element.full_name.charAt(0)}.{element.full_name.slice(element.full_name.indexOf(" ")).split(" ").join(" ").trim()[0]} </Text>
                                        </View>
                                      </>
                                  }
                                </Pressable>
                              

                            )
                          }
                        </View>
                        :
                        <>
                        <View className="items-center justify-center h-[65vh]">

                        <Text className={`text-xl  font-light ${colorScheme === 'dark' ? 'text-white' : 'text-black/20'}`}>No Participant available</Text>
                        </View>

                        </>
                    }
                  </>
                  :
                  <>
                    <View className="flex-row flex-wrap justify-between">
                      {
                        Array.from({ length: 20 }).map((e, i) =>
                          <View key={i} className={`w-[14vh] h-[14vh] mt-2 rounded-full animate-pulse  ${colorScheme === 'dark' ? 't bg-[#252529]' : 'bg-[#c3c3c366]'}`}></View>
                        )
                      }
                    </View>
                  </>
              }


            </ScrollView>
          </View>
          :
          <>
            <View className="h-screen bg-black/80 items-center justify-center">

              <View className="w-96 h-96 border border-white rounded-lg">

                <CameraView
                  facing="back"
                  onBarcodeScanned={(text) => { checkStudent(text.data) }}
                >
                  <View className="w-full h-full ">

                  </View>
                </CameraView>
              </View>



              {waiting &&
                <View className="w-full h-screen items-center justify-center px-5 absolute top-0  bg-black/70">

                  {
                    message ?
                      message == "Credentials match." ?
                        <View className="flex-col items-center">
                          <Logo color={"#4ade80"} size={100} />
                          <Text className="text-2xl text-green-400">Welcome</Text>
                        </View>
                        : message == "Already participated." ?
                          <View className="flex-col items-center">
                            <Logo color={"#fb923c"} size={100} />
                            <Text className="text-2xl text-orange-400">Already Passed</Text>
                          </View>
                        : message == "Participant belong to another session" ?
                          <View className="flex-col items-center">
                            <Logo color={"#fff"} size={100} />
                            <Text className="text-2xl text-white">Participant belong to another session</Text>
                          </View>
                          :
                          <View className="flex-col items-center">
                            <Logo color={"#dc2626"} size={100} />
                            <Text className="text-2xl text-red-600">No such participated</Text>
                          </View>
                      :
                      <LoadingScreen />

                  }
                </View>
              }
            </View>
          </>
      }
    </>
  );
}
