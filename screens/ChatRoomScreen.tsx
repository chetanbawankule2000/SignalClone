import { View, Text, StyleSheet, FlatList, SafeAreaView } from "react-native";
import React from "react";
import Message from "../components/Message";
import Chats from "../assets/dummy-data/Chats";
import ChatRooms from "../assets/dummy-data/ChatRooms";
import MessageInput from "../components/MessageInput";
import { useRoute } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";

const ChatRoomScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params;

  navigation.setOptions({ title: "Elom Musk" });

  return (
    <SafeAreaView style={styles.page}>
      <FlatList
        data={Chats.messages}
        inverted
        renderItem={({ item }) => <Message message={item} />}
      />
      <MessageInput />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
});

export default ChatRoomScreen;
