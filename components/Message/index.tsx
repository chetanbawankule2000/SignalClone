import {
  View,
  Text,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import React, { useEffect, useState } from "react";
import styles from "./styles";
import { Auth, DataStore } from "aws-amplify";
import { S3Image } from "aws-amplify-react-native";
import { User } from "../../src/models";

const Message = ({ message }) => {
  const BLUE = "#3872E9";
  const LIGHGREY = "lightgrey";
  const [user, setUser] = useState<User | undefined>();
  const [isMe, setIsMe] = useState<boolean>(false);

  const { width } = useWindowDimensions();

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
      {message.image && (
        <View style={{ marginVertical: message.content ? 10 : 0 }}>
          <S3Image
            imgKey={message.image}
            style={{
              width: width * 0.7,
              aspectRatio: 4 / 3,
            }}
            resizeMode="contain"
          />
        </View>
      )}
      <Text style={{ color: isMe ? "black" : "white" }}>{message.content}</Text>
    </View>
  );
};

export default Message;
