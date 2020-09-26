import { Component } from '@angular/core';
import { NavController, Toast, ToastController } from 'ionic-angular';
import { ChatscreenPage } from '../chatscreen/chatscreen';
import { Chat } from '../../models/chat.models';
import { User } from '../../models/user.models';
import { Constants } from '../../models/constants.models';
import { Message } from '../../models/message.models';
import { TranslateService } from '@ngx-translate/core';
import * as firebase from 'firebase/app';

@Component({
  selector: 'page-chatslist',
  templateUrl: 'chatslist.html'
})
export class ChatslistPage {
  private chats = new Array<Chat>();
  private chatsAll = new Array<Chat>();
  private userMe: User;
  private myInboxRef: firebase.database.Reference;
  private toast: Toast;

  constructor(private navCtrl: NavController, private toastCtrl: ToastController, private translate: TranslateService) {
    const component = this;
    this.userMe = JSON.parse(window.localStorage.getItem(Constants.KEY_USER));
    this.myInboxRef = firebase.database().ref(Constants.REF_INBOX).child(this.userMe.id + "hp");
    this.myInboxRef.on('child_added', function (data) {
      let newMessage = data.val() as Message;
      if (newMessage && newMessage.id && newMessage.chatId) {
        let newChat = Chat.fromMessage(newMessage, (component.userMe.id + "hp") == newMessage.senderId);
        component.chatsAll.push(newChat);
        component.chatsAll.sort((one, two) => (one.dateTimeStamp > two.dateTimeStamp ? -1 : 1));
        component.chats = component.chatsAll;
        component.dismissToast();
      }
    });

    this.myInboxRef.on('child_changed', function (data) {
      var oldMessage = data.val() as Message;
      if (oldMessage && oldMessage.id && oldMessage.chatId) {
        let oldChat = Chat.fromMessage(oldMessage, ((component.userMe.id + "hp") == oldMessage.senderId));
        let oldIndex = -1;
        for (let i = 0; i < component.chatsAll.length; i++) {
          if (oldChat.chatId == component.chatsAll[i].chatId) {
            oldIndex = i;
            break;
          }
        }
        if (oldIndex != -1) {
          component.chatsAll.splice(oldIndex, 1);
          component.chatsAll.unshift(oldChat);
          component.chats = component.chatsAll;
        }
      }
    });

    this.translate.get("just_moment").subscribe(value => {
      this.showToast(value);
    });
  }

  chatscreen(chat) {
    this.navCtrl.push(ChatscreenPage, { chat: chat });
  }

  showToast(message: string) {
    this.toast = this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'bottom'
    });
    this.toast.onDidDismiss(() => {
      console.log('Dismissed toast');
    });
    this.toast.present();
  }

  dismissToast() {
    if (this.toast) {
      this.toast.dismiss();
      this.toast = null;
    }
  }

}
