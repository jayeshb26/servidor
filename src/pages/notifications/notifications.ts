import { Component } from '@angular/core';
import { Constants } from '../../models/constants.models';
import { MyNotification } from '../../models/notifications.models';

@Component({
  selector: 'page-notifications',
  templateUrl: 'notifications.html'
})
export class NotificationsPage {
  private notifications = new Array<MyNotification>();

  constructor() { }

  ionViewDidEnter() {
    let notifications: Array<MyNotification> = JSON.parse(window.localStorage.getItem(Constants.KEY_NOTIFICATIONS));
    if (notifications && notifications.length) {
      for (let noti of notifications) {
        if (noti.title.toLowerCase().includes("pending")) {
          noti.title = "Pending";
        } else if (noti.title.toLowerCase().includes("accepted")) {
          noti.title = "Accepted";
          noti.colorclass = "completed";
        } else if (noti.title.toLowerCase().includes("onway")) {
          noti.title = "On the way";
        } else if (noti.title.toLowerCase().includes("ongoing")) {
          noti.title = "On going";
        } else if (noti.title.toLowerCase().includes("complete")) {
          noti.title = "Complete";
          noti.colorclass = "completed";
        } else if (noti.title.toLowerCase().includes("cancelled")) {
          noti.title = "Cancelled";
          noti.colorclass = "cancelled";
        } else if (noti.title.toLowerCase().includes("rejected")) {
          noti.title = "Rejected";
          noti.colorclass = "cancelled";
        } else if (noti.title.toLowerCase().includes("message")) {
          noti.title = "New Message";
          noti.colorclass = "new_message";
        }
      }
	  this.notifications = notifications.reverse();
    }
  }
}
