import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  useWindowDimensions,
} from "react-native";
import { FontAwesome, Feather } from "@expo/vector-icons";

const ChatRoomHeader = (props) => {
  console.log(props);
  const { width } = useWindowDimensions();

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        width: width - 55,
        padding: 10,
        alignItems: "center",
      }}
    >
      <Image
        source={{
          uri: "https://notjustdev-dummy.s3.us-east-2.amazonaws.com/avatars/vadim.jpg",
        }}
        style={{ width: 30, height: 30, borderRadius: 30 }}
      />
      <Text
        style={{
          flex: 1,
          marginLeft: 10,
          fontWeight: "bold",
          color: "white",
        }}
      >
        {props.children}
      </Text>
      <Pressable onPress={() => {}}>
        <Feather
          name="settings"
          size={24}
          color="white"
          style={{ marginHorizontal: 10 }}
        />
      </Pressable>
      <Pressable onPress={() => {}}>
        <Feather
          name="edit-2"
          size={24}
          color="white"
          style={{ marginHorizontal: 10 }}
        />
      </Pressable>
    </View>
  );
};

export default ChatRoomHeader;
