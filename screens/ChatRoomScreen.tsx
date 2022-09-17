import { View, Text, StyleSheet, FlatList, SafeAreaView } from "react-native";
import React, { useState, useEffect } from "react";
import Message from "../components/Message";
import Chats from "../assets/dummy-data/Chats";
import ChatRooms from "../assets/dummy-data/ChatRooms";
import MessageInput from "../components/MessageInput";
import { useRoute } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import { Auth, DataStore, SortDirection } from "aws-amplify";
import { Message as MessageModel } from "../src/models";
import { Chatroom } from "../src/models";
import { ActivityIndicator } from "react-native";

const ChatRoomScreen = () => {
  const [messages, setMessages] = useState<MessageModel[]>([]);
  const [messageReplyTo, setMessageReplyTo] = useState<MessageModel | null>(
    null
  );
  const [chatroom, setChatroom] = useState<Chatroom | null>(null);
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params;

  useEffect(() => {
    fetchMessages();
  }, [chatroom]);

  useEffect(() => {
    fetchChatroom();
  }, []);
  const fetchChatroom = async () => {
    if (!id) {
      return;
    }
    const chatRoom = await DataStore.query(Chatroom, id);
    if (!chatRoom) {
      console.error("Chatroom with this id not exist");
    } else {
      setChatroom(chatRoom);
    }
  };

  useEffect(() => {
    const subscription = DataStore.observe(MessageModel).subscribe((msg) => {
      if (msg.model === MessageModel && msg.opType === "INSERT") {
        setMessages((existingMsg) => [msg.element, ...existingMsg]);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchMessages = async () => {
    if (!chatroom) {
      return;
    }
    const authUer = await Auth.currentAuthenticatedUser();
    const myId = authUer.attributes.sub;
    const fetchedMessages = await DataStore.query(
      MessageModel,
      (message) => message.chatroomID("eq", chatroom?.id).forUserId("eq", myId),
      { sort: (message) => message.createdAt(SortDirection.DESCENDING) }
    );
    setMessages(fetchedMessages);
  };

  if (!chatroom) {
    return <ActivityIndicator />;
  }
  return (
    <SafeAreaView style={styles.page}>
      <FlatList
        data={messages}
        inverted
        renderItem={({ item }) => (
          <Message
            message={item}
            setMessadeReplyTo={() => setMessageReplyTo(item)}
            // onLongPress={() => deleteConfirmation(item)}
          />
        )}
      />
      <MessageInput
        chatRoom={chatroom}
        messageReplyTo={messageReplyTo}
        removeMessageReplyTo={() => setMessageReplyTo(null)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
});

export default ChatRoomScreen;
