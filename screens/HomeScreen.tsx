import { StyleSheet, Text, View, Image, FlatList } from "react-native";
import React, { useEffect } from "react";
import { User } from "../src/models";
import ChatRooms from "../assets/dummy-data/ChatRooms";

import ChatRoomItem from "../components/ChatRoomItem";

const TabOneScreen = () => {
  return (
    <View style={styles.page}>
      <FlatList
        data={ChatRooms}
        renderItem={({ item }) => <ChatRoomItem room={item} />}
      />
    </View>
  );
};

export default TabOneScreen;

const styles = StyleSheet.create({
  page: { flex: 1 },
});
