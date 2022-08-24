import { View, Text, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import styles from "./styles";
import { Auth, DataStore } from "aws-amplify";
import { User } from "../../src/models";

const Message = ({ message }) => {
  const BLUE = "#3872E9";
  const LIGHGREY = "lightgrey";
  const [user, setUser] = useState<User | undefined>();
  const [isMe, setIsMe] = useState<boolean>(false);

  useEffect(() => {
    DataStore.query(User, message.userID).then(setUser);
  }, []);

  useEffect(() => {
    if (!user) return;
    const checkIfMe = async () => {
      const authuser = await Auth.currentAuthenticatedUser();
      if (authuser.attributes.sub === user.id) {
        setIsMe(true);
      }
    };
    checkIfMe();
  }, [user]);
  const myId = "u1";

  if (!user) {
    return <ActivityIndicator />;
  }
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
