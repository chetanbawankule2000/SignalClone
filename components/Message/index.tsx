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
import MessageReply from "../MessageReply";

const Message = (props) => {
  const { setMessadeReplyTo, message: propMessage } = props;
  const BLUE = "#3872E9";
  const LIGHGREY = "lightgrey";
  const [user, setUser] = useState<User | undefined>();
  const [isMe, setIsMe] = useState<boolean | null>(null);
  const [repliedTo, setRepliedTo] = useState<MessageModel | null>(null);
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

  useEffect(() => {
    if (message?.replyToMessageID) {
      DataStore.query(MessageModel, message.replyToMessageID).then(
        setRepliedTo
      );
    }
  }, [message]);

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
    <Pressable
      onLongPress={setMessadeReplyTo}
      style={[
        styles.container,
        !isMe ? styles.leftContainer : styles.rightContainer,
        { width: soundURI ? "75%" : "auto" },
      ]}
    >
      {repliedTo && <MessageReply message={repliedTo} />}
      <View style={styles.row}>
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
            {!!message.content && (
              <Text style={{ color: isMe ? "black" : "white" }}>
                {message.content}
              </Text>
            )}
          </View>
        )}
        {soundURI && <AudioPlayer soundURI={soundURI} />}
        {!!message.content && !message.image && (
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
            style={{ marginHorizontal: 5, alignSelf: "flex-end" }}
          />
        )}
      </View>
    </Pressable>
  );
};

export default Message;
