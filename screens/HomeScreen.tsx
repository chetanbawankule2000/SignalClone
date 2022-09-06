import { StyleSheet, Text, View, Image, FlatList } from "react-native";
import React, { useEffect, useState } from "react";
import { User, Chatroom, ChatroomUser } from "../src/models";
import ChatRooms from "../assets/dummy-data/ChatRooms";
import { Auth, DataStore } from "aws-amplify";

import ChatRoomItem from "../components/ChatRoomItem";

const TabOneScreen = () => {
  const [chatroom, setChatroom] = useState<Chatroom[]>([]);

  useEffect(() => {
    const fetchChatrooms = async () => {
      const authUser = await Auth.currentAuthenticatedUser();

      const chatRooms = (await DataStore.query(ChatroomUser))
        .filter(
          (chatRoomUser) => chatRoomUser.user.id === authUser.attributes.sub
        )
        .map((chatroomUser) => chatroomUser.chatroom);
      setChatroom(chatRooms);
      console.log(chatRooms);
    };
    fetchChatrooms();
  }, []);
  return (
    <View style={styles.page}>
      <FlatList
        data={chatroom}
        renderItem={({ item }) => <ChatRoomItem room={item} />}
      />
    </View>
  );
};

export default TabOneScreen;

const styles = StyleSheet.create({
  page: { flex: 1 },
});
