import { StyleSheet, Text, View, Image, Pressable } from "react-native";
import React from "react";
import styles from "./styles";
import { useNavigation } from "@react-navigation/native";

const ChatRoomItem = ({ room = {} }) => {
  const navigation = useNavigation();
  const user = room.users[1];
  return (
    <Pressable
      style={styles.container}
      onPress={() => navigation.navigate("ChatRoom", { id: room.id })}
    >
      <Image
        source={{
          uri: user.imageUri,
        }}
        style={styles.image}
      ></Image>
      <View style={styles.badgeContainer}>
        <Text style={styles.badgeText}>4</Text>
      </View>
      <View style={styles.rightcontainer}>
        <View style={styles.row}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.text}>{room?.lastMessage?.createdAt}</Text>
        </View>
        <Text numberOfLines={1} style={styles.text}>
          {room.lastMessage.content}
        </Text>
      </View>
    </Pressable>
  );
};

export default ChatRoomItem;
