import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import { FontAwesome, Feather } from "@expo/vector-icons";
import { DataStore, Auth } from "aws-amplify";
import { Chatroom, ChatroomUser } from "../src/models";

const ChatRoomHeader = ({ id, children }) => {
  const { width } = useWindowDimensions();
  const [users, setUsers] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!id) return;
    const fetchUsers = async () => {
      const fetchedUsers = (await DataStore.query(ChatroomUser))
        .filter((chatroomusers) => chatroomusers.chatroom.id === id)
        .map((chatroomUser) => chatroomUser.user);

      console.log(fetchedUsers);

      setUsers(fetchedUsers);
      const authUser = await Auth.currentAuthenticatedUser();
      setUser(
        fetchedUsers.find((user) => user.id !== authUser.attributes.sub) || null
      );
    };

    fetchUsers();
  }, []);

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        width: width - 55,
        padding: 10,
        alignItems: "center",
      }}
    >
      <Image
        source={{
          uri: user?.imageUri,
        }}
        style={{ width: 30, height: 30, borderRadius: 30 }}
      />
      <Text
        style={{
          flex: 1,
          marginLeft: 10,
          fontWeight: "bold",
          color: "white",
        }}
      >
        {user?.name}
      </Text>
      <Pressable onPress={() => {}}>
        <Feather
          name="settings"
          size={24}
          color="white"
          style={{ marginHorizontal: 10 }}
        />
      </Pressable>
      <Pressable onPress={() => {}}>
        <Feather
          name="edit-2"
          size={24}
          color="white"
          style={{ marginHorizontal: 10 }}
        />
      </Pressable>
    </View>
  );
};

export default ChatRoomHeader;
