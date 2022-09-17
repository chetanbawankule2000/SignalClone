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
import { Chatroom, ChatroomUser, User } from "../src/models";
import moment from "moment";
import { useNavigation } from "@react-navigation/native";

const ChatRoomHeader = ({ id, children }) => {
  const { width } = useWindowDimensions();
  const [users, setUsers] = useState(null);
  const [user, setUser] = useState<User | null>(null);
  const [chatRoom, setChatRoom] = useState<Chatroom | null>(null);

  const navigation = useNavigation();

  const fetchUsers = async () => {
    const fetchedUsers = (await DataStore.query(ChatroomUser))
      .filter((chatroomusers) => chatroomusers.chatroom.id === id)
      .map((chatroomUser) => chatroomUser.user);

    // console.log(fetchedUsers);

    setUsers(fetchedUsers);
    const authUser = await Auth.currentAuthenticatedUser();
    setUser(
      fetchedUsers.find((user) => user.id !== authUser.attributes.sub) || null
    );
  };

  const fetchChatroom = async () => {
    await DataStore.query(Chatroom, id).then(setChatRoom);
  };

  useEffect(() => {
    if (!id) return;

    fetchUsers();
    fetchChatroom();
  }, []);

  const isGroup = users?.length > 2;

  const getLastOnlineText = () => {
    // if last online is less than 5 min show his online
    if (!user?.lastOnlineAt) {
      return;
    }
    const lastOnlineDiff = moment().diff(moment(user?.lastOnlineAt));
    if (lastOnlineDiff < 5 * 60 * 1000) {
      return "online";
    } else {
      return `Last seen online ${moment(user.lastOnlineAt).fromNow()}`;
    }
  };

  const getUserNames = () => {
    return users.map((user) => user.name).join(",");
  };

  const openInfo = () => {
    navigation.navigate("GroupInfoScreen", { id });
  };

  return (
    <Pressable
      onPress={openInfo}
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
          uri: chatRoom?.imageUri ? chatRoom.imageUri : user?.imageUri,
        }}
        style={{ width: 30, height: 30, borderRadius: 30 }}
      />
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text
          style={{
            fontWeight: "bold",
            color: "white",
          }}
        >
          {chatRoom?.name ? chatRoom.name : user?.name}
        </Text>
        <Text numberOfLines={1} style={{ fontWeight: "bold", color: "white" }}>
          {isGroup ? getUserNames() : getLastOnlineText()}
        </Text>
      </View>
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
    </Pressable>
  );
};

export default ChatRoomHeader;
