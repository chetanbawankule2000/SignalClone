import "react-native-get-random-values";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import React, { useState, useEffect } from "react";
import {
  SimpleLineIcons,
  Feather,
  MaterialCommunityIcons,
  AntDesign,
  Ionicons,
} from "@expo/vector-icons";
import { Message } from "../../src/models";
import { Auth, DataStore, Storage } from "aws-amplify";
import { Chatroom } from "../../src/models";
import EmojiSelector from "react-native-emoji-selector";
import * as ImagePicker from "expo-image-picker";
import { v4 as uuidv4 } from "uuid";
import { Audio, AVPlaybackStatus } from "expo-av";
import AudioPlayer from "../AudioPlayer";

const MessageInput = ({ chatRoom }) => {
  const [message, setMessage] = useState("");
  const [authUser, setAuthUser] = useState(null);
  const [emojipickerOpen, setEmojipickerOpen] = useState(false);
  const [image, setImage] = useState(null);
  const [progress, setProgress] = useState(0);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  // const [sound, setSound] = useState<Audio.Sound | null>(null);
  // const [paused, setPaused] = useState(true);
  // const [audioProgress, setAudioProgress] = useState(0);
  // const [audioDuration, setAudioDuration] = useState(0);
  const [soundUri, setSoundUri] = useState<String | null>(null);

  useEffect(() => {
    Auth.currentAuthenticatedUser().then(setAuthUser);
  }, []);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        const libraryResponse =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        const photoResponse = await ImagePicker.requestCameraPermissionsAsync();
        await Audio.requestPermissionsAsync();
        if (
          libraryResponse.status !== "granted" ||
          photoResponse.status !== "granted"
        ) {
          alert("Sorry, we need roll permission to make this work!");
        }
      }
    })();
  }, []);

  const onPress = () => {
    if (image) {
      sendImage();
    } else if (soundUri) {
      sendAudio();
    } else if (message) {
      sendMessage();
    } else {
      onplusclicked();
    }
  };

  const sendImage = async () => {
    if (!image) {
      return;
    }
    const blob = await getBlob(image);
    const { key } = await Storage.put(`${uuidv4()}.png`, blob, {
      progressCallback,
    });
    if (!authUser) return;
    const newMessage = await DataStore.save(
      new Message({
        content: message,
        image: key,
        userID: authUser?.attributes?.sub,
        chatroomID: chatRoom.id,
      })
    );
    setResetFields();
    updateLastMessage(newMessage);
  };

  const sendAudio = async () => {
    if (!soundUri) {
      return;
    }
    const blob = await getBlob(soundUri);
    const uriParts = soundUri.split(".");
    const extension = uriParts[uriParts.length - 1];
    const { key } = await Storage.put(`${uuidv4()}.${extension}`, blob, {
      progressCallback,
    });
    if (!authUser) return;
    const newMessage = await DataStore.save(
      new Message({
        content: message,
        audio: key,
        userID: authUser?.attributes?.sub,
        chatroomID: chatRoom.id,
      })
    );
    setResetFields();
    updateLastMessage(newMessage);
  };

  const progressCallback = (progress) => {
    console.log("Uploaded: ", progress.loaded);
    setProgress(progress.loaded / progress.total);
  };

  const sendMessage = async () => {
    // console.log(authUser);

    // const authuser = await Auth.currentAuthenticatedUser();
    if (!authUser) return;
    const newMessage = await DataStore.save(
      new Message({
        content: message,
        userID: authUser?.attributes?.sub,
        chatroomID: chatRoom.id,
      })
    );
    setResetFields();
    updateLastMessage(newMessage);
  };

  const setResetFields = () => {
    setMessage("");
    setEmojipickerOpen(false);
    setImage(null);
    setProgress(0);
    setSoundUri(null);
  };

  const updateLastMessage = async (newMessage) => {
    await DataStore.save(
      Chatroom.copyOf(
        chatRoom,
        (updatedChatRoom) => (updatedChatRoom.LastMessage = newMessage)
      )
    );
  };
  const onplusclicked = () => {
    console.log("Onplus clicked");
  };

  // Image picker
  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setImage(result?.uri);
    }
  };

  const takephoto = async () => {
    // No permissions request is necessary for launching the image library
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setImage(result?.uri);
    }
  };

  const getBlob = async (uri) => {
    if (!uri) {
      return;
    }
    const response = await fetch(uri);
    const blob = await response.blob();
    return blob;
  };

  // Audio
  async function startRecording() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      console.log("Starting recording..");
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      console.log("Recording started");
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  }

  async function stopRecording() {
    if (!recording) {
      return;
    }
    console.log("Stopping recording..");
    setRecording(null);
    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
    const uri = recording.getURI();
    setSoundUri(uri);
    console.log("Recording stopped and stored at", uri);

    if (!uri) {
      return;
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { height: emojipickerOpen ? "50%" : "auto" }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={100}
    >
      {image && (
        <View style={styles.sendImageContainer}>
          <Image
            source={{ uri: image }}
            style={{ height: 100, width: 100, borderRadius: 10 }}
          />
          <View
            style={{
              flex: 1,
              justifyContent: "flex-start",
              alignSelf: "flex-end",
            }}
          >
            <View
              style={{
                height: 5,
                backgroundColor: "#3872E9",
                borderRadius: 5,
                width: `${progress * 100}%`,
              }}
            ></View>
          </View>
          <Pressable onPress={() => setImage(null)}>
            <AntDesign
              name="closecircleo"
              size={24}
              color="white"
              style={{ margin: 5 }}
            />
          </Pressable>
        </View>
      )}
      {soundUri && (
        // <View style={styles.sendAudioContainer}>
        //   <Pressable onPress={playPauseSound}>
        //     <Feather name={paused ? "play" : "pause"} size={24} color="grey" />
        //   </Pressable>
        //   <View style={styles.audioProgressBG}>
        //     <View
        //       style={[
        //         styles.audioProgressFG,
        //         { left: `${audioProgress * 100}%` },
        //       ]}
        //     />
        //   </View>
        //   <Text style={{ color: "lightgray", marginLeft: 10 }}>
        //     {getDuration()}
        //   </Text>
        // </View>
        <AudioPlayer soundURI={soundUri} />
      )}
      <View style={styles.row}>
        <View style={styles.inputContainer}>
          <Pressable onPress={() => setEmojipickerOpen(!emojipickerOpen)}>
            <SimpleLineIcons
              name="emotsmile"
              size={24}
              color="grey"
              style={styles.icon}
            />
          </Pressable>
          <TextInput
            style={styles.input}
            placeholder="Signal message..."
            onChangeText={setMessage}
            value={message}
          />
          <Pressable onPress={pickImage}>
            <Feather name="image" size={24} color="grey" style={styles.icon} />
          </Pressable>
          <Pressable onPress={takephoto}>
            <Feather name="camera" size={24} color="grey" style={styles.icon} />
          </Pressable>

          <Pressable onPressIn={startRecording} onPressOut={stopRecording}>
            <MaterialCommunityIcons
              name={recording ? "microphone" : "microphone-outline"}
              size={24}
              color={recording ? "red" : "grey"}
              style={styles.icon}
            />
          </Pressable>
        </View>
        <Pressable style={styles.buttonContainer} onPress={onPress}>
          {message || image || soundUri ? (
            <Ionicons name="send" size={18} color="white" />
          ) : (
            <AntDesign name="plus" size={24} color="white" />
          )}
        </Pressable>
      </View>
      {/* <EmojiSelector
        onEmojiSelected={(emoji) =>
          setMessage((currentMessage) => currentMessage + emoji)
        }
        columns={8}
      /> */}
    </KeyboardAvoidingView>
  );
};

export default MessageInput;

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  row: {
    flexDirection: "row",
  },
  inputContainer: {
    backgroundColor: "#f2f2f2",
    flex: 1,
    marginRight: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "grey",
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
  },
  input: {
    flex: 1,
    marginHorizontal: 5,
  },
  icon: {
    marginHorizontal: 5,
  },
  buttonContainer: {
    width: 40,
    height: 40,
    backgroundColor: "#3872E9",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
  },
  buttonText: {
    fontSize: 35,
    fontWeight: "300",
    color: "white",
  },
  sendImageContainer: {
    flexDirection: "row",
    margin: 10,
    alignSelf: "stretch",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "grey",
  },
  sendAudioContainer: {
    marginVertical: 10,
    padding: 10,
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "lightgrey",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  audioProgressBG: {
    height: 5,
    backgroundColor: "lightgray",
    borderRadius: 5,
    flex: 1,
    margin: 3,
  },
  audioProgressFG: {
    width: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: "#3777f0",
    position: "absolute",
    top: -3,
  },
});
