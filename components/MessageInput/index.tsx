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
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
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
import MessageComp from "../Message";
import { encrypt, stringToUTF8array, getSecretKey } from "../../utils/crypto";
import { ChatroomUser } from "../../src/models";
import { secretbox, randomBytes, setPRNG, box } from "tweetnacl";

const MessageInput = ({ chatRoom, messageReplyTo, removeMessageReplyTo }) => {
  const [message, setMessage] = useState("");
  const [authUser, setAuthUser] = useState(null);
  const [emojipickerOpen, setEmojipickerOpen] = useState(false);
  const [image, setImage] = useState(null);
  const [progress, setProgress] = useState(0);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [soundUri, setSoundUri] = useState<String | null>(null);

  const navigation = useNavigation();
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
        replyToMessageID: messageReplyTo?.id,

        // status: "SENT",
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
        status: "SENT",
        replyToMessageID: messageReplyTo?.id,
      })
    );
    setResetFields();
    updateLastMessage(newMessage);
  };

  const progressCallback = (progress) => {
    setProgress(progress.loaded / progress.total);
  };

  const sendMessaheToUser = async (user, fromUserId) => {
    console.log("message is ", message);
    if (!message) {
      return;
    }
    const secretKey = await getSecretKey();
    if (!secretKey) {
      return;
    }

    if (!user.publicKey) {
      Alert.alert(
        "user havent set your key pairs yet",
        " Go to settings and generate new key pair",
        [
          {
            text: "Open Settings",
            onPress: () => navigation.navigate("Settings"),
          },
        ]
      );
      return;
    }

    const sharedA = box.before(stringToUTF8array(user.publicKey), secretKey);

    const encryptedMessage = encrypt(sharedA, { message });

    console.log("Encrypted messahe", encryptedMessage);

    console.log("sendig message", user.id, "and", fromUserId);
    const newMessage = await DataStore.save(
      new Message({
        content: encryptedMessage, //Encrypt this message
        userID: fromUserId,
        chatroomID: chatRoom.id,
        replyToMessageID: messageReplyTo?.id,
        forUserId: user.id,

        // status: "SENT",
      })
    );

    // updateLastMessage(newMessage);
  };

  const sendMessage = async () => {
    //get publick key of other users
    const users = (await DataStore.query(ChatroomUser))
      .filter((cru) => cru.chatroom.id === chatRoom.id)
      .map((cru) => cru.user);
    console.log("Chatroom users", users);

    if (!authUser) return;

    await Promise.all(
      users.map((user) => {
        sendMessaheToUser(user, authUser.attributes.sub);
      })
    );

    setResetFields();

    //for each user encrypt the contenet with his publich key and save it as new message
  };

  const setResetFields = () => {
    setMessage("");
    setEmojipickerOpen(false);
    setImage(null);
    setProgress(0);
    setSoundUri(null);
    removeMessageReplyTo();
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
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  }

  async function stopRecording() {
    if (!recording) {
      return;
    }
    setRecording(null);
    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
    const uri = recording.getURI();
    setSoundUri(uri);

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
      {messageReplyTo && (
        <View
          style={{
            backgroundColor: "#f2f2f2",
            padding: 5,
            borderRadius: 10,
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flex: 1 }}>
            <Text>Reply To:</Text>
            <MessageComp message={messageReplyTo} />
          </View>
          <Pressable onPress={() => removeMessageReplyTo()}>
            <AntDesign
              name="close"
              size={24}
              color="black"
              style={{ margin: 5 }}
            />
          </Pressable>
        </View>
      )}
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
