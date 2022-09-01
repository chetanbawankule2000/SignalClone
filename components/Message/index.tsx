import {
  View,
  Text,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import React, { useEffect, useState } from "react";
import styles from "./styles";
import { Auth, DataStore, Storage } from "aws-amplify";
import { S3Image } from "aws-amplify-react-native";
import { User } from "../../src/models";
import AudioPlayer from "../AudioPlayer";
import { Ionicons } from "@expo/vector-icons";
import { Message as MessageModel } from "../../src/models";

const Message = (props) => {
  const BLUE = "#3872E9";
  const LIGHGREY = "lightgrey";
  const [user, setUser] = useState<User | undefined>();
  const [isMe, setIsMe] = useState<boolean | null>(null);
  const [soundURI, setSoundURI] = useState<any>();
  const [message, setMessage] = useState<MessageModel>(props.message);

  const { width } = useWindowDimensions();

  useEffect(() => {
    DataStore.query(User, message.userID).then(setUser);
  }, []);

  useEffect(() => {
    const subscription = DataStore.observe(MessageModel, message.id).subscribe(
      (msg) => {
        if (msg.model === MessageModel && msg.opType === "UPDATE") {
          setMessage((message) => ({ ...message, ...msg.element }));
        }
      }
    );
    return () => subscription.unsubscribe();
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

  useEffect(() => {
    setMessageRead();
  }, [isMe, message]);

  const setMessageRead = async () => {
    if (isMe === false && message.status !== "READ") {
      await DataStore.save(
        MessageModel.copyOf(message, (updated) => {
          updated.status = "READ";
        })
      );
    }
  };

  if (!user) {
    return <ActivityIndicator />;
  }
  return (
    <View
      style={[
        styles.container,
        !isMe ? styles.leftContainer : styles.rightContainer,
        { width: soundURI ? "75%" : "auto" },
      ]}
    >
      {message.image && (
        <View style={{ marginVertical: message.content ? 10 : 0 }}>
          <S3Image
            imgKey={message.image}
            style={{
              width: width * 0.65,
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
          name={message.status === "DELIVERED" ? "checkmark" : "checkmark-done"}
          size={16}
          color="black"
          style={{ marginHorizontal: 5 }}
        />
      )}
      {/* <Ionicons name="checkmark-done" size={24} color="black" /> */}
    </View>
  );
};

export default Message;
