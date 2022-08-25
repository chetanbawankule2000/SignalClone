/**
 * If you are not familiar with React Navigation, refer to the "Fundamentals" guide:
 * https://reactnavigation.org/docs/getting-started
 *
 */
import { FontAwesome, Feather, SimpleLineIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
  useNavigation,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as React from "react";
import { ColorSchemeName, Pressable, View, Image, Text } from "react-native";
import { useWindowDimensions } from "react-native";
import ChatRoomHeader from "./ChatRoomHeader";
import { Auth } from "aws-amplify";

import Colors from "../constants/Colors";
import useColorScheme from "../hooks/useColorScheme";
import ModalScreen from "../screens/ModalScreen";
import NotFoundScreen from "../screens/NotFoundScreen";
import TabOneScreen from "../screens/HomeScreen";
import TabTwoScreen from "../screens/TabTwoScreen";
import UsersScreen from "../screens/UsersScreen";

import ChatRoomScreen from "../screens/ChatRoomScreen";
import {
  RootStackParamList,
  RootTabParamList,
  RootTabScreenProps,
} from "../types";
import LinkingConfiguration from "./LinkingConfiguration";

export default function Navigation({
  colorScheme,
}: {
  colorScheme: ColorSchemeName;
}) {
  return (
    <NavigationContainer
      linking={LinkingConfiguration}
      theme={colorScheme === "dark" ? DarkTheme : DefaultTheme}
    >
      <RootNavigator />
    </NavigationContainer>
  );
}

/**
 * A root stack navigator is often used for displaying modals on top of all other content.
 * https://reactnavigation.org/docs/modal
 */
const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={TabOneScreen}
        options={{ headerTitle: HomeHeader }}
      />
      <Stack.Screen
        name="ChatRoom"
        component={ChatRoomScreen}
        options={({ route }) => ({
          headerTitle: () => <ChatRoomHeader id={route?.params?.id} />,
          headerBackTitleVisible: false,
        })}
      />
      <Stack.Screen
        name="UsersScreen"
        component={UsersScreen}
        options={({ route }) => ({
          title: "Users",
        })}
      />
      <Stack.Screen
        name="NotFound"
        component={NotFoundScreen}
        options={{ title: "Oops!" }}
      />
      <Stack.Group screenOptions={{ presentation: "modal" }}>
        <Stack.Screen name="Modal" component={ModalScreen} />
      </Stack.Group>
    </Stack.Navigator>
  );
}

const HomeHeader = (props) => {
  const { width } = useWindowDimensions();
  const navigation = useNavigation();

  const logout = () => {
    console.log("Logout");
    Auth.signOut();
  };

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        width,
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
          textAlign: "center",
          marginLeft: 50,
          fontWeight: "bold",
          color: "white",
        }}
      >
        Signal
      </Text>
      <Pressable onPress={() => {}}>
        <Feather
          name="settings"
          size={24}
          color="white"
          style={{ marginHorizontal: 10 }}
        />
      </Pressable>
      <Pressable
        onPress={() => {
          navigation.navigate("UsersScreen");
        }}
      >
        <Feather
          name="edit-2"
          size={24}
          color="white"
          style={{ marginHorizontal: 10 }}
        />
      </Pressable>
      <Pressable onPress={logout}>
        <SimpleLineIcons
          name="logout"
          size={24}
          color="white"
          style={{ marginHorizontal: 10 }}
        />
      </Pressable>
    </View>
  );
};

// const ChatRoomHeader = (props) => {
//   const { width } = useWindowDimensions();

//   return (
//     <View
//       style={{
//         flexDirection: "row",
//         justifyContent: "space-between",
//         width: width - 50,
//         padding: 10,
//         alignItems: "center",
//       }}
//     >
//       <Image
//         source={{
//           uri: "https://notjustdev-dummy.s3.us-east-2.amazonaws.com/avatars/vadim.jpg",
//         }}
//         style={{ width: 30, height: 30, borderRadius: 30 }}
//       />
//       <Text
//         style={{
//           flex: 1,
//           marginLeft: 10,
//           fontWeight: "bold",
//           color: "white",
//         }}
//       >
//         Signal
//       </Text>
//       <Pressable onPress={() => {}}>
//         <Feather
//           name="settings"
//           size={24}
//           color="white"
//           style={{ marginHorizontal: 10 }}
//         />
//       </Pressable>
//       <Pressable onPress={() => {}}>
//         <Feather
//           name="edit-2"
//           size={24}
//           color="white"
//           style={{ marginHorizontal: 10 }}
//         />
//       </Pressable>
//     </View>
//   );
// };

/**
 * A bottom tab navigator displays tab buttons on the bottom of the display to switch screens.
 * https://reactnavigation.org/docs/bottom-tab-navigator
 */

/**
 * You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
 */
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={30} style={{ marginBottom: -3 }} {...props} />;
}
