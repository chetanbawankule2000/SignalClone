import { StyleSheet, Text, View, TextInput, Pressable } from "react-native";
import React, { useState, useEffect } from "react";
import {
  SimpleLineIcons,
  Feather,
  MaterialCommunityIcons,
  AntDesign,
  Ionicons,
} from "@expo/vector-icons";
import { Message } from "../../src/models";
import { Auth, DataStore } from "aws-amplify";
import { Chatroom } from "../../src/models";

const MessageInput = ({ chatRoom }) => {
  const [message, setMessage] = useState("");
  const [authUser, setAuthUser] = useState(null);

  useEffect(() => {
    Auth.currentAuthenticatedUser().then(setAuthUser);
  }, []);

  const onPress = () => {
    if (message) {
      sendMessage();
    } else {
      onplusclicked();
    }
  };

  const sendMessage = async () => {
    console.log(authUser);

    // const authuser = await Auth.currentAuthenticatedUser();
    if (!authUser) return;
    const newMessage = await DataStore.save(
      new Message({
        content: message,
        userID: authUser?.attributes?.sub,
        chatroomID: chatRoom.id,
      })
    );
    setMessage("");
    updateLastMessage(newMessage);
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
  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <SimpleLineIcons
          name="emotsmile"
          size={24}
          color="grey"
          style={styles.icon}
        />
        <TextInput
          style={styles.input}
          placeholder="Signal message..."
          onChangeText={setMessage}
          value={message}
        />
        <Feather name="camera" size={24} color="grey" style={styles.icon} />
        <MaterialCommunityIcons
          name="microphone-outline"
          size={24}
          color="grey"
          style={styles.icon}
        />
      </View>
      <Pressable style={styles.buttonContainer} onPress={onPress}>
        {message ? (
          <Ionicons name="send" size={18} color="white" />
        ) : (
          <AntDesign name="plus" size={24} color="white" />
        )}
      </Pressable>
    </View>
  );
};

export default MessageInput;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 10,
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
});
