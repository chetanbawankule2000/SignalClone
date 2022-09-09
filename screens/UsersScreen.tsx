import {
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
  Pressable,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import ChatRooms from "../assets/dummy-data/ChatRooms";
import { DataStore, Auth } from "aws-amplify";
import NewGroupButton from "../components/NewGroupButton";

import ChatRoomItem from "../components/ChatRoomItem";
import Users from "../assets/dummy-data/Users";
import UserItem from "../components/UserItem";
import { Chatroom, User, ChatroomUser } from "../src/models";
import { useNavigation } from "@react-navigation/native";

const UsersScreen = () => {
  const navigation = useNavigation();

  const [users, setUsers] = useState<User[]>([]);
  const [isNewGroup, setIsNewGroup] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  useEffect(() => {
    DataStore.query(User).then(setUsers);
  }, []);

  const addUsersToChatRoom = async (user, chatroom) => {
    DataStore.save(new ChatroomUser({ user, chatroom }));
  };

  const createChatRoom = async (users) => {
    //connnect authenticated user to chat room
    const authUser = await Auth.currentAuthenticatedUser();
    const dbUser = await DataStore.query(User, authUser.attributes.sub);

    if (!dbUser) {
      Alert.alert("There was an error creating a group.");
    }

    const newChatRoomData = { newMessages: 0, Admin: dbUser };
    if (users.length > 1) {
      newChatRoomData.name = "New Group";
      newChatRoomData.imageUri =
        "https://notjustdev-dummy.s3.us-east-2.amazonaws.com/avatars/group.jpeg";
    }

    // create a chat room
    const newChatRoom = await DataStore.save(new Chatroom(newChatRoomData));

    if (dbUser) {
      console.log("dbuset", dbUser);
      await addUsersToChatRoom(dbUser, newChatRoom);
    } else {
      console.log("No dbUser", authUser);
    }

    await Promise.all(
      users.map((user) => addUsersToChatRoom(user, newChatRoom))
    );

    navigation.navigate("ChatRoom", { id: newChatRoom.id });
  };

  const isUserSelected = (user) => {
    return selectedUsers.some((selectedUser) => selectedUser.id === user.id);
  };
  const onUserPress = async (user) => {
    if (isNewGroup) {
      if (isUserSelected(user)) {
        //remove it from selected
        setSelectedUsers(
          selectedUsers.filter((selectedUser) => selectedUser.id !== user.id)
        );
      } else {
        setSelectedUsers([...selectedUsers, user]);
      }
    } else {
      await createChatRoom([user]);
    }
  };

  const saveGroup = async () => {
    await createChatRoom(selectedUsers);
  };
  return (
    <View style={styles.page}>
      <FlatList
        data={users}
        renderItem={({ item }) => (
          <UserItem
            user={item}
            onPress={() => onUserPress(item)}
            isSelected={isNewGroup ? isUserSelected(item) : undefined}
          />
        )}
        ListHeaderComponent={() => (
          <NewGroupButton onPress={() => setIsNewGroup(!isNewGroup)} />
        )}
      />
      {isNewGroup && (
        <Pressable style={styles.button} onPress={saveGroup}>
          <Text style={styles.buttonText}>
            Save group ({selectedUsers.length})
          </Text>
        </Pressable>
      )}
    </View>
  );
};

export default UsersScreen;

const styles = StyleSheet.create({
  page: { flex: 1 },
  button: {
    padding: 10,
    backgroundColor: "#3777f0",
    borderRadius: 10,
    marginHorizontal: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});
