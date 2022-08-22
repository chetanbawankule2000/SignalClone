import { ModelInit, MutableModel, PersistentModelConstructor } from "@aws-amplify/datastore";





type MessageMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type ChatroomMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type UserMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type ChatroomUserMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

export declare class Message {
  readonly id: string;
  readonly content: string;
  readonly userID: string;
  readonly chatroomID: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  constructor(init: ModelInit<Message, MessageMetaData>);
  static copyOf(source: Message, mutator: (draft: MutableModel<Message, MessageMetaData>) => MutableModel<Message, MessageMetaData> | void): Message;
}

export declare class Chatroom {
  readonly id: string;
  readonly newMessages?: number | null;
  readonly LastMessage?: Message | null;
  readonly Messages?: (Message | null)[] | null;
  readonly ChartRoomUsers?: (ChatroomUser | null)[] | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly chatroomLastMessageId?: string | null;
  constructor(init: ModelInit<Chatroom, ChatroomMetaData>);
  static copyOf(source: Chatroom, mutator: (draft: MutableModel<Chatroom, ChatroomMetaData>) => MutableModel<Chatroom, ChatroomMetaData> | void): Chatroom;
}

export declare class User {
  readonly id: string;
  readonly name: string;
  readonly imageUri?: string | null;
  readonly status?: string | null;
  readonly Messages?: (Message | null)[] | null;
  readonly chatrooms?: (ChatroomUser | null)[] | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  constructor(init: ModelInit<User, UserMetaData>);
  static copyOf(source: User, mutator: (draft: MutableModel<User, UserMetaData>) => MutableModel<User, UserMetaData> | void): User;
}

export declare class ChatroomUser {
  readonly id: string;
  readonly chatroom: Chatroom;
  readonly user: User;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  constructor(init: ModelInit<ChatroomUser, ChatroomUserMetaData>);
  static copyOf(source: ChatroomUser, mutator: (draft: MutableModel<ChatroomUser, ChatroomUserMetaData>) => MutableModel<ChatroomUser, ChatroomUserMetaData> | void): ChatroomUser;
}