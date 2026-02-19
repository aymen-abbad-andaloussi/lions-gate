import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "@/hooks/useColorScheme";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  BackHandler,
} from "react-native";

const appContext = createContext();

const AppProvider = ({ children }) => {
  const APP_URL = "https://lionsgeek.ma/api/";
  const IMAGE_URL = `https://lionsgeek.ma/storage/images`;
  // const APP_URL = "http://192.168.100.100:8000/api/";
  // const IMAGE_URL = `http://192.168.100.100:8000/storage/images`;

  const [infoSession, setInfoSession] = useState([]);
  const [events, setEvents] = useState([]);
  const [refreshingSession, setRefreshingSession] = useState(false);
  const [showUnauthorizedModal, setShowUnauthorizedModal] = useState(false);

  const colorScheme = useColorScheme();
  const Token =  "7jqMvTW3ynWRDcRHA4KtJivEq69DQVpfuEexD1sM";

  const sessionData = async () => {
    try {
      setRefreshingSession(true);
      const response = await axios.get(`${APP_URL}lionsgate/infosessions`, {
        headers: { Authorization: `Bearer ${Token}` },
      });
      const infos = response.data?.infos;
      setInfoSession(Array.isArray(infos) ? infos : []);
    } catch (error) {
      if (error.response?.status === 401) {
        setShowUnauthorizedModal(true);
      }
    } finally {
      setRefreshingSession(false);
    }
  };

  const eventData = async () => {
    try {
      const response = await axios.get(`${APP_URL}events`, {
        headers: { Authorization: `Bearer ${Token}` },
      });
      const evts = response.data;
      setEvents(Array.isArray(evts) ? evts : (Array.isArray(evts?.data) ? evts.data : []));
    } catch (error) {
      if (error.response?.status === 401) {
        setShowUnauthorizedModal(true);
      }
    }
  };

  useEffect(() => {
    sessionData();
    eventData();
  }, []);

  const appValue = {
    colorScheme,
    infoSession,
    events,
    IMAGE_URL,
    APP_URL,
    Token,
    sessionData,
    refreshingSession,
    setRefreshingSession,
    showUnauthorizedModal,
    setShowUnauthorizedModal,
  };

  return (
    <appContext.Provider value={appValue}>
      {children}

      {/* Unauthorized modal */}
      <Modal
        transparent={true}
        visible={showUnauthorizedModal}
        animationType="fade"
        onRequestClose={() => {
          // Prevent closing with back button → exit app instead
          BackHandler.exitApp();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.title}>Access Denied</Text>
            <Text style={styles.message}>You don't have access anymore.</Text>

            <TouchableOpacity
              style={styles.button}
              onPress={() => BackHandler.exitApp()}
            >
              <Text style={styles.buttonText}>Exit App</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </appContext.Provider>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 10,
    width: 300,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  button: {
    backgroundColor: "#dc2626",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});

const useAppContext = () => useContext(appContext);

export { AppProvider, appContext, useAppContext };
