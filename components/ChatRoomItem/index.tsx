import {
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect } from "react";
import styles from "./styles";
import { useNavigation } from "@react-navigation/native";
import { Auth, DataStore } from "aws-amplify";
import { Chatroom, ChatroomUser, Message, User } from "../../src/models";

const ChatRoomItem = ({ room = {} }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [lastMessage, setLastMessage] = useState<Message | undefined>();
  const navigation = useNavigation();

  useEffect(() => {
    if (!room?.chatroomLastMessageId) return;
    DataStore.query(Message, room.chatroomLastMessageId).then(setLastMessage);
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      const fetchedUsers = (await DataStore.query(ChatroomUser))
        .filter((chatroomusers) => chatroomusers.chatroom.id === room.id)
        .map((chatroomUser) => chatroomUser.user);

      // console.log(fetchedUsers);

      setUsers(fetchedUsers);
      const authUser = await Auth.currentAuthenticatedUser();
      setUser(
        fetchedUsers.find((user) => user.id !== authUser.attributes.sub) || null
      );
    };

    fetchUsers();
  }, []);

  if (!user) {
    return <ActivityIndicator />;
  }
  return (
    <Pressable
      style={styles.container}
      onPress={() => navigation.navigate("ChatRoom", { id: room.id })}
    >
      <Image
        source={{
          uri: room.imageUri || user.imageUri,
        }}
        style={styles.image}
      ></Image>
      {!!room.newMessages && (
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>{room.newMessages}</Text>
        </View>
      )}
      <View style={styles.rightcontainer}>
        <View style={styles.row}>
          <Text style={styles.name}>{room.name || user.name}</Text>
          <Text style={styles.text}>{lastMessage?.createdAt}</Text>
        </View>
        <Text numberOfLines={1} style={styles.text}>
          {lastMessage?.content}
        </Text>
      </View>
    </Pressable>
  );
};

export default ChatRoomItem;
