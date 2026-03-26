export type MessageType = {
  id: string;
  userId: string;
  roomId: string;
  sender: string;
  content: string;
  isBot: boolean;
  createdAt: string;
  deletedAt: string | null;
  type: "message" | "poll";
  pollId?: string;
}

export type Notification = {
  id: string;
  roomId: string;
  roomName: string;
  mentionedBy: string;
  preview: string;
  read: boolean;
  createdAt: string;
}

export type Room = {
  id: string;
  creatorId: string;
  name: string;
  createdAt: number;
}