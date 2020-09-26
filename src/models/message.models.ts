import { Helper } from "./helper.models";

export class Message {
    senderName: string;
    senderImage: string;
    senderStatus: string;
    recipientName: string;
    recipientImage: string;
    recipientStatus: string;
    recipientId: string;
    senderId: string;
    chatId: string;
    id: string;
    timeDiff: string;
    body: string;
    dateTimeStamp: string;
    delivered: boolean;
    sent: boolean;

    fromRow(arg0: any) {
        this.senderName = arg0.senderName;
        this.senderImage = arg0.senderImage;
        this.senderStatus = arg0.senderStatus;
        this.recipientName = arg0.recipientName;
        this.recipientImage = arg0.recipientImage;
        this.recipientStatus = arg0.recipientStatus;
        this.recipientId = arg0.recipientId;
        this.senderId = arg0.senderId;
        this.chatId = arg0.chatId;
        this.id = arg0.id;
        this.body = arg0.body;
        this.dateTimeStamp = arg0.dateTimeStamp;
        this.timeDiff = Helper.formatMillisDateTime(Number(this.dateTimeStamp), Helper.getLocale());
        this.delivered = arg0.delivered == 1;
        this.sent = arg0.sent == 1;
    }
}