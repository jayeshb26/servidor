import { Helper } from './helper.models';
import { Message } from './message.models';

export class Chat {
    chatId: string;
    myId: string;
    dateTimeStamp: string;
    timeDiff: string;
    lastMessage: string;
    chatName: string;
    chatImage: string;
    chatStatus: string;
    isGroup: boolean;
    isRead: boolean;

    static fromMessage(msg: Message, isMeSender: boolean): Chat {
        let chat = new Chat();
        chat.chatId = isMeSender ? msg.recipientId : msg.senderId;
        chat.myId = isMeSender ? msg.senderId : msg.recipientId;
        chat.chatName = isMeSender ? msg.recipientName : msg.senderName;
        chat.chatImage = isMeSender ? msg.recipientImage : msg.senderImage;
        chat.chatStatus = isMeSender ? msg.recipientStatus : msg.senderStatus;
        chat.dateTimeStamp = msg.dateTimeStamp;
        chat.timeDiff = Helper.formatMillisDateTime(Number(chat.dateTimeStamp), Helper.getLocale());
        chat.lastMessage = msg.body;
        return chat;
    }
}