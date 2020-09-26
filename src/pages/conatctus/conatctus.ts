import { Component } from '@angular/core';
import { NavController, Loading, LoadingController, ToastController } from 'ionic-angular';
import { ClientService } from '../../providers/client.service';
import { User } from '../../models/user.models';
import { Subscription } from 'rxjs/Subscription';
import { Constants } from '../../models/constants.models';
import { SupportRequest } from '../../models/support-request.models';
import { CallNumber } from '@ionic-native/call-number';
import { Helper } from '../../models/helper.models';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'page-conatctus',
  templateUrl: 'conatctus.html',
  providers: [ClientService]
})
export class ConatctusPage {
  private userMe: User;
  private loading: Loading;
  private loadingShown = false;
  private supportRequest: SupportRequest;
  private subscriptions: Array<Subscription> = [];

  constructor(private navCtrl: NavController, private service: ClientService, private callNumber: CallNumber,
    private loadingCtrl: LoadingController, private toastCtrl: ToastController, private translate: TranslateService) {
    this.userMe = JSON.parse(window.localStorage.getItem(Constants.KEY_USER));
    this.supportRequest = new SupportRequest(this.userMe.name, this.userMe.email, "");
  }

  ionViewWillLeave() {
    this.subscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
    this.dismissLoading();
  }

  dialSupport() {
    let phoneNumber = Helper.getSetting("support_phone");
    if (phoneNumber) {
      this.callNumber.callNumber(phoneNumber, true).then(res => console.log('Launched dialer!', res)).catch(err => console.log('Error launching dialer', err));
    }
  }

  submitSupport() {
    if (!this.supportRequest.message || !this.supportRequest.message.length) {
      this.translate.get("err_valid_support_msg").subscribe(value => {
        this.showToast(value);
      });
    } else {
      this.translate.get("supporting").subscribe(value => {
        this.presentLoading(value);
      });
      let subscription: Subscription = this.service.submitSupport(window.localStorage.getItem(Constants.KEY_TOKEN), this.supportRequest).subscribe(res => {
        this.dismissLoading();
        this.translate.get("supporting_success").subscribe(value => {
          this.showToast(value);
        });
        this.navCtrl.pop();
      }, err => {
        this.navCtrl.pop();
        this.dismissLoading();
        console.log('support', err);
      });
      this.subscriptions.push(subscription);
    }
  }

  showToast(message: string) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 2000,
      position: 'bottom'
    });
    toast.onDidDismiss(() => {
      console.log('Dismissed toast');
    });
    toast.present();
  }

  private presentLoading(message: string) {
    this.loading = this.loadingCtrl.create({
      content: message
    });
    this.loading.onDidDismiss(() => { });
    this.loading.present();
    this.loadingShown = true;
  }

  private dismissLoading() {
    if (this.loadingShown) {
      this.loadingShown = false;
      this.loading.dismiss();
    }
  }
}
