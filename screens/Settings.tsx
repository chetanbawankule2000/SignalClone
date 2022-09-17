import { StyleSheet, Text, View, Pressable, Alert } from "react-native";
import React from "react";
import { generateKeyPair } from "../utils/crypto";
import { DataStore, Auth } from "aws-amplify";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "../src/models";
const Settings = () => {
  const Private_key = "Private_key";
  const updateKeyPair = async () => {
    //generate public and private key
    //store private key in asyncstprage
    //store public key in UserModel in Datastore
    const { publicKey, secretKey } = generateKeyPair();
    console.log(publicKey, secretKey);
    await AsyncStorage.setItem(Private_key, secretKey.toString());
    const userData = await Auth.currentAuthenticatedUser();
    const dbUser = await DataStore.query(User, userData.attributes.sub);
    if (dbUser) {
      await DataStore.save(
        User.copyOf(dbUser, (updated) => {
          updated.publicKey = publicKey.toString();
        })
      );
      Alert.alert("Successfully updated key pair");
    } else {
      Alert.alert("Db user not found");
    }
  };
  return (
    <View style={styles.container}>
      <Pressable onPress={updateKeyPair}>
        <Text style={styles.settingText}>Settings</Text>
      </Pressable>
    </View>
  );
};

export default Settings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  settingText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 30,
    padding: 10,
  },
});
