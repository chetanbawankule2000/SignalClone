import { StyleSheet, Text, View, Image, FlatList } from "react-native";
import React, { useEffect, useState } from "react";
import { User } from "../src/models";
import ChatRooms from "../assets/dummy-data/ChatRooms";
import { DataStore } from "aws-amplify";

import ChatRoomItem from "../components/ChatRoomItem";
import Users from "../assets/dummy-data/Users";
import UserItem from "../components/UserItem";

const UsersScreen = () => {
  const [users, setUsers] = useState<User[]>([]);
  useEffect(() => {
    DataStore.query(User).then(setUsers);
    // const fetchUsers = async () => {
    //   const response = await DataStore.query(User);
    //   console.log("Users are ", response);
    //   setUsers(response);
    // };
    // fetchUsers();
  }, []);
  return (
    <View style={styles.page}>
      <FlatList
        data={users}
        renderItem={({ item }) => <UserItem user={item} />}
      />
    </View>
  );
};

export default UsersScreen;

const styles = StyleSheet.create({
  page: { flex: 1 },
});
