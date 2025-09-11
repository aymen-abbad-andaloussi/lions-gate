import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "@/hooks/useColorScheme";

const appContext = createContext();

const AppProvider = ({ children }) => {

  const APP_URL = "http://192.168.100.100:8000/api/";
  const IMAGE_URL = `http://192.168.100.100:8000/storage/images`

  // const APP_URL = "https://lionsgeek.ma/api/";
  // const IMAGE_URL = `https://lionsgeek.ma/storage/images`

  const [infoSession, setInfoSession] = useState(null)
  const [events, setEvents] = useState(null)
  const [refreshingSession, setRefreshingSession] = useState(false);


  const colorScheme = useColorScheme()
  const sessionData = async () => {
    setRefreshingSession(true)
    let response = await axios.get(APP_URL + "lionsgate/infosessions")
    let data = response?.data
    
    setInfoSession(data.infos)
    setRefreshingSession(false)
  }
  const eventData = async () => {
    let response = await axios.get(APP_URL + "events")
    // console.log(response);
    let data = response?.data
    setEvents(data)
  }
  useEffect(() => {
    sessionData()
    eventData()
  }, [])




  const appValue = {
    colorScheme,
    infoSession,
    events,
    IMAGE_URL,
    APP_URL,
    sessionData,
    refreshingSession,
    setRefreshingSession
  };
  return <appContext.Provider value={appValue}>{children}</appContext.Provider>;
};

const useAppContext = () => useContext(appContext);

export { AppProvider, appContext, useAppContext };
