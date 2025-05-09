import React from "react";
import { View, Button, Alert } from "react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

const ShareEvent = ({imagePath}) => {
  // const imagePath = 'http://192.168.100.136:8000/assets/posts/screenshot_Hamza.png'
  const shareToLinkedIn = async () => {
    try {
      if (!imagePath) {
        Alert.alert("Error", "No image URL provided.");
        return;
      }
      // useEffect(() => {
      // console.log("HomeScreen user", user);
      // }, [user]);

      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert(
          "Sharing not supported",
          "This device does not support sharing files."
        );
        return;
      }

      // Download the image to the cache directory
      const fileUri = FileSystem.cacheDirectory + "shared-event-image.png";
      const downloadRes = await FileSystem.downloadAsync(imagePath, fileUri);
      console.log("Image downloaded to:", imagePath);
      // Share the downloaded image
      await Sharing.shareAsync(downloadRes.uri, {
        mimeType: "image/png",
        dialogTitle: "Share this event",
        UTI: "image/png", // iOS-specific
      });
    } catch (error) {
      console.error("Error sharing:", error);
      Alert.alert("Error", "Failed to share the image.");
    }
  };

  return (
    <View style={{ margin: 20 }}>
      <Button title="Share Event Image" onPress={shareToLinkedIn} />
    </View>
  );
};

export default ShareEvent;
