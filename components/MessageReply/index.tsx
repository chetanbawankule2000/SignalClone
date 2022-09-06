import {
  View,
  Text,
  ActivityIndicator,
  useWindowDimensions,
  Pressable,
} from "react-native";
import React, { useEffect, useState } from "react";
import styles from "./styles";
import { Auth, DataStore, Storage } from "aws-amplify";
import { S3Image } from "aws-amplify-react-native";
import { User } from "../../src/models";
import AudioPlayer from "../AudioPlayer";
import { Ionicons } from "@expo/vector-icons";
import { Message as MessageModel } from "../../src/models";

const MessageReply = (props) => {
  const { message: propMessage } = props;
  const BLUE = "#3872E9";
  const LIGHGREY = "lightgrey";
  const [user, setUser] = useState<User | undefined>();
  const [isMe, setIsMe] = useState<boolean | null>(null);
  const [soundURI, setSoundURI] = useState<any>();
  const [message, setMessage] = useState<MessageModel>(propMessage);

  const { width } = useWindowDimensions();

  useEffect(() => {
    setMessage(propMessage);
  }, [propMessage]);

  useEffect(() => {
    DataStore.query(User, message.userID).then(setUser);
  }, []);

  useEffect(() => {
    if (message.audio) {
      Storage.get(message.audio).then(setSoundURI);
    }
  }, [message]);
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
    <Pressable
      style={[
        styles.container,
        isMe ? styles.rightContainer : styles.leftContainer,
        { width: soundURI ? "75%" : "auto" },
      ]}
    >
      <View style={styles.row}>
        {message.image && (
          <View style={{ marginVertical: message.content ? 10 : 0 }}>
            <S3Image
              imgKey={message.image}
              style={{
                width: "100%",
                aspectRatio: 4 / 3,
              }}
              resizeMode="contain"
            />
          </View>
        )}
        {soundURI && <AudioPlayer soundURI={soundURI} />}
        {!!message.content && (
          <Text style={{ color: isMe ? "black" : "white" }}>
            {message.content}
          </Text>
        )}
        {isMe && message.status && message.status !== "SENT" && (
          <Ionicons
            name={
              message.status === "DELIVERED" ? "checkmark" : "checkmark-done"
            }
            size={16}
            color="black"
            style={{ marginHorizontal: 5 }}
          />
        )}
      </View>
    </Pressable>
  );
};

export default MessageReply;
