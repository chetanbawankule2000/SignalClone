import { StyleSheet, Text, View, Image, FlatList } from "react-native";
import React from "react";

import ChatRooms from "../assets/dummy-data/ChatRooms";

import ChatRoomItem from "../components/ChatRoomItem";

const TabOneScreen = () => {
  return (
    <View style={styles.page}>
      <FlatList
        data={ChatRooms}
        renderItem={({ item }) => <ChatRoomItem room={item} />}
      />
      {/* <ChatRoomItem />
      <ChatRoomItem /> */}
    </View>
  );
};

export default TabOneScreen;

const styles = StyleSheet.create({
  page: { flex: 1 },
});
