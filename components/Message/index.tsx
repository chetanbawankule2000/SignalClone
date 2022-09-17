import {
  View,
  Text,
  ActivityIndicator,
  useWindowDimensions,
  Pressable,
  Modal,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import styles from "./styles";
import { Auth, DataStore, Storage } from "aws-amplify";
import { S3Image } from "aws-amplify-react-native";
import { User } from "../../src/models";
import AudioPlayer from "../AudioPlayer";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { Message as MessageModel } from "../../src/models";
import MessageReply from "../MessageReply";
import { decrypt, getSecretKey, stringToUTF8array } from "../../utils/crypto";
import { box } from "tweetnacl";
const Message = (props) => {
  const { setMessadeReplyTo, message: propMessage } = props;
  const BLUE = "#3872E9";
  const LIGHGREY = "lightgrey";
  const [user, setUser] = useState<User | undefined>();
  const [decryptedMessage, setDecryptedMessage] = useState("");
  const [isMe, setIsMe] = useState<boolean | null>(null);
  const [repliedTo, setRepliedTo] = useState<MessageModel | null>(null);
  const [soundURI, setSoundURI] = useState<any>();
  const [message, setMessage] = useState<MessageModel>(propMessage);
  const [modalVisible, setModalVisible] = useState(false);
  const [messageDelete, setMessageDelete] = useState<boolean>(false);

  const { width } = useWindowDimensions();
  const [actions, setActions] = useState(["Reply"]);

  // const actions = ["Reply"];

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
        } else if (msg.model === MessageModel && msg.opType === "DELETE") {
          console.log("opt type");
          setMessageDelete(true);
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

  useEffect(() => {
    if (!message?.content || !user?.publicKey) {
      console.log("Inside return", message.content);
      return;
    }
    const getDecryptedMessage = async () => {
      const secretKey = await getSecretKey();
      if (!secretKey) {
        return;
      }
      const sharedB = box.before(stringToUTF8array(user?.publicKey), secretKey);
      const decryptedContent = decrypt(sharedB, message.content);
      if (!decryptedContent.message) {
        Alert.alert("There is a empty message");
      }
      console.log("Decrypted", decryptedContent);
      if (!decryptedContent?.message) {
        return;
      }
      setDecryptedMessage(decryptedContent.message);
    };
    getDecryptedMessage();
  }, [message, user]);

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
    console.log("The message is ", message.status, "and", isMe);
    if (isMe !== true && message.status !== "READ") {
      await DataStore.save(
        MessageModel.copyOf(message, (updated) => {
          updated.status = "READ";
        })
      );
    }
  };

  const deleteMessage = async () => {
    await DataStore.delete(message);
  };

  const onconfirmMessadeDelete = () => {
    Alert.alert(
      "Confirm deletion",
      "Are you sure you want to delete this message?",
      [
        {
          text: "Delete",
          onPress: deleteMessage,
        },
        {
          text: "Cancle",
        },
      ]
    );
  };

  const onActionpress = (index) => {
    setModalVisible(false);
    if (index == 0) {
      // Alert.alert('Reply ')
      setMessadeReplyTo();
    } else {
      onconfirmMessadeDelete();
    }
  };

  const onOpenModal = () => {
    if (isMe) {
      setActions(["Reply", "Delete"]);
    }
    setModalVisible(true);
  };
  if (!user) {
    return <ActivityIndicator />;
  }
  return (
    <Pressable
      // onLongPress={setMessadeReplyTo}
      onLongPress={() => onOpenModal()}
      style={[
        styles.container,
        !isMe ? styles.leftContainer : styles.rightContainer,
        { width: soundURI ? "75%" : "auto" },
      ]}
    >
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert("Modal has been closed.");
          setModalVisible(!modalVisible);
        }}
      >
        <View style={{ flex: 1 }}>
          <View
            style={{
              height: "30%",
              width: "100%",
              elevation: 1,
              backgroundColor: "white",
              borderRadius: 10,
              position: "absolute",
              bottom: 0,
              padding: 10,
            }}
          >
            <Pressable onPress={() => setModalVisible(false)}>
              <AntDesign
                name="close"
                size={30}
                color="black"
                style={{ alignSelf: "flex-end", margin: 10 }}
              />
            </Pressable>

            {actions.map((action, index) => {
              return (
                <Pressable key={index} onPress={() => onActionpress(index)}>
                  <Text style={styles.modaltext}>{action}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </Modal>
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
            {!!decryptedMessage && (
              <Text style={{ color: isMe ? "black" : "white" }}>
                {messageDelete ? "Message deleted" : decryptedMessage}
              </Text>
            )}
          </View>
        )}
        {soundURI && <AudioPlayer soundURI={soundURI} />}
        {!!decryptedMessage && !message.image && (
          <Text style={{ color: isMe ? "black" : "white" }}>
            {messageDelete ? "Message deleted" : decryptedMessage}
          </Text>
        )}
        {isMe && !!message.status && message.status !== "SENT" && (
          <Ionicons
            name={
              message.status === "DELIVERED" ? "checkmark" : "checkmark-done"
            }
            size={16}
            color="gray"
            style={{ marginHorizontal: 5 }}
          />
        )}
      </View>
    </Pressable>
  );
};

export default Message;
