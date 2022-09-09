import { StyleSheet, Text, View, FlatList, Alert } from "react-native";
import React, { useState, useEffect } from "react";
import { Auth, DataStore } from "aws-amplify";
import { useRoute } from "@react-navigation/native";
import { Chatroom, ChatroomUser } from "../../src/models";
import UserItem from "../../components/UserItem";

const GroupInfoScreen = () => {
  const [chatroom, setChatroom] = useState<Chatroom | null>(null);
  const [users, setUsers] = useState(null);

  const route = useRoute();
  const { id } = route?.params;

  useEffect(() => {
    fetchChatroom();
    fetchUsers();
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

  const fetchUsers = async () => {
    const fetchedUsers = (await DataStore.query(ChatroomUser))
      .filter((chatroomusers) => chatroomusers.chatroom.id === id)
      .map((chatroomUser) => chatroomUser.user);

    // console.log(fetchedUsers);

    setUsers(fetchedUsers);
  };

  const confirmDeleteUser = (user) => {
    const authuser = Auth.currentAuthenticatedUser();
    if (chatroom?.Admin?.id !== authuser?.attributes?.sub) {
      Alert.alert("You are adimin you can not delete users");
      return;
    }

    if (user.id === chatroom?.Admin?.id) {
      Alert.alert("You are adimin you can not delete yourself");
    } else {
      Alert.alert(
        "Confirm delete user",
        `Are you sure you want to delete ${user.name}`,
        [
          {
            text: "Delete",
            onPress: () => deleteUser(user),
            style: "destructive",
          },
          {
            text: "Cancel",
          },
        ]
      );
    }
  };

  const deleteUser = async (user) => {
    console.log("delete this user", user);
    const deletChatRoomUser = await (
      await DataStore.query(ChatroomUser)
    ).filter(
      (cru) => cru?.chatroom?.id === chatroom.id && cru.user.id === user.id
    );
    console.log(deletChatRoomUser);
    if (deletChatRoomUser.length > 0) {
      await DataStore.delete(deletChatRoomUser[0]);
      setUsers(users.filter((u) => u.id !== user.id));
    }
  };
  return (
    <View style={styles.root}>
      <Text style={styles.title}>{chatroom?.name}</Text>
      <FlatList
        data={users}
        renderItem={({ item }) => (
          <UserItem
            user={item}
            isAdmin={chatroom?.Admin?.id === item.id}
            onLongPress={() => confirmDeleteUser(item)}
          />
        )}
      />
    </View>
  );
};

export default GroupInfoScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    paddingVertical: 10,
  },
});
