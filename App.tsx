import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import React, { useState, useEffect } from "react";

import useCachedResources from "./hooks/useCachedResources";
import useColorScheme from "./hooks/useColorScheme";
import Navigation from "./navigation";
import Amplify, { DataStore, Hub, Auth } from "aws-amplify";
import config from "./src/aws-exports";
import { withAuthenticator } from "aws-amplify-react-native";
import { Message, User } from "./src/models";
import { secretbox, randomBytes, setPRNG, box } from "tweetnacl";
import { generateKeyPair, encrypt, decrypt } from "./utils/crypto";
Amplify.configure({
  ...config,
  Analytics: {
    disabled: true,
  },
});

// setPRNG(PRNG);

const obj = { hello: "world" };
const pairA = generateKeyPair();
const pairB = generateKeyPair();
const sharedA = box.before(pairB.publicKey, pairA.secretKey);
const sharedB = box.before(pairA.publicKey, pairB.secretKey);
const encrypted = encrypt(sharedA, obj);
const decrypted = decrypt(sharedB, encrypted);
console.log(obj, encrypted, decrypted);
const App = () => {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }
    const subscription = DataStore.observe(User, user.id).subscribe((msg) => {
      if (msg.model === User && msg.opType === "UPDATE") {
        setUser(msg.element);
      }
    });
    return () => subscription.unsubscribe();
  }, [user?.id]);

  useEffect(() => {
    const interval = setInterval(async () => {
      await updateLastOnline();
    }, 1 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchUser = async () => {
    const authUser = await Auth.currentAuthenticatedUser();
    const user = await DataStore.query(User, authUser.attributes.sub);

    if (user) {
      setUser(user);
    }
  };

  const updateLastOnline = async () => {
    if (!user) {
      return;
    }
    const response = await DataStore.save(
      User.copyOf(user, (updated) => {
        updated.lastOnlineAt = +new Date();
      })
    );
    console.log(response.lastOnlineAt);
    setUser(response);
  };

  useEffect(() => {
    // Create listener
    const listener = Hub.listen("datastore", async (hubData) => {
      const { event, data } = hubData.payload;
      if (event === "networkStatus") {
        console.log(`User has a network connection: ${data.active}`);
      }
      if (
        event === "outboxMutationProcessed" &&
        data.model === Message &&
        !["DELIVERED", "READ"].includes(data.element.status)
      ) {
        console.log("Mutaion has been synced with cloude", data);
        //set message status to devivered
        DataStore.save(
          Message.copyOf(data.element, (update) => {
            update.status = "DELIVERED";
          })
        );
      }
    });

    // Remove listener
    return () => listener();
  }, []);

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <SafeAreaProvider>
        <Navigation colorScheme={colorScheme} />

        <StatusBar />
      </SafeAreaProvider>
    );
  }
};

export default withAuthenticator(App);
