import { View, Text } from "react-native";
import React from "react";
import styles from "./styles";

const Message = ({ message }) => {
  const BLUE = "#3872E9";
  const LIGHGREY = "lightgrey";
  const myId = "u1";
  const isMe = message.user.id == myId;
  return (
    <View
      style={[
        styles.container,
        !isMe ? styles.leftContainer : styles.rightContainer,
      ]}
    >
      <Text style={{ color: isMe ? "black" : "white" }}>{message.content}</Text>
    </View>
  );
};

export default Message;
