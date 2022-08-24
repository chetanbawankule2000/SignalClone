import { StyleSheet, Text, View, Image, Pressable } from "react-native";
import React from "react";
import styles from "./styles";
import { useNavigation } from "@react-navigation/native";
import { Chatroom, User, ChatroomUser } from "../../src/models";
import { DataStore, Auth } from "aws-amplify";

const UserItem = ({ user = {} }) => {
  const navigation = useNavigation();

  const onPress = async () => {
    // create a chat room
    const newChatRoom = await DataStore.save(new Chatroom({ newMessages: 0 }));

    //connnect authenticated user to chat room
    const authUser = await Auth.currentAuthenticatedUser();
    const dbUser = await DataStore.query(User, authUser.attributes.sub);

    await DataStore.save(
      new ChatroomUser({ user: dbUser, chatroom: newChatRoom })
    );

    await DataStore.save(new ChatroomUser({ user, chatroom: newChatRoom }));
    navigation.navigate("ChatRoom", { id: newChatRoom.id });
  };
  return (
    <Pressable style={styles.container} onPress={onPress}>
      <Image
        source={{
          uri: user.imageUri,
        }}
        style={styles.image}
      ></Image>
      <View style={styles.rightcontainer}>
        <View style={styles.row}>
          <Text style={styles.name}>{user.name}</Text>
        </View>
      </View>
    </Pressable>
  );
};

export default UserItem;
