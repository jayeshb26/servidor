import { Profile } from '../../models/profile.models';
import { Component } from '@angular/core';
import { NavController, NavParams, Loading, LoadingController, AlertController, Events } from 'ionic-angular';
import { ClientService } from '../../providers/client.service';
import { Subscription } from 'rxjs/Subscription';
import { Constants } from '../../models/constants.models';
import { TranslateService } from '@ngx-translate/core';
import { Diagnostic } from '@ionic-native/diagnostic';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import { MyLocation } from '../../models/my-location.models';
import { CallNumber } from '@ionic-native/call-number';
import * as firebase from 'firebase/app';
import { Transactions } from '../../models/transaction.models';

@Component({
  selector: 'page-servidor',
  templateUrl: 'servidor.html',
  providers: [ClientService]
})
export class ServidorPage {
  private loading: Loading;
  private isLoading = false;
  private loadingShown = false;
  private allDone: Boolean = false;
  private subscriptions: Array<Subscription> = [];
  private geoSubscription: Subscription;
  private profile: Profile;
  private role: string;
  private profileMe: Profile;
  private transactions: Array<Transactions> = [];
  private infiniteScroll: any;
  private pageNo = 1;

  constructor(private navCtrl: NavController, navParam: NavParams, private service: ClientService, private events: Events,
    private loadingCtrl: LoadingController, private geolocation: Geolocation, private callNumber: CallNumber,
    private translate: TranslateService, private diagnostic: Diagnostic, private alertCtrl: AlertController) {
    this.profile = JSON.parse(window.localStorage.getItem(Constants.KEY_PROFILE));
    this.role = JSON.parse(window.localStorage.getItem(Constants.KEY_ROLE));
  }

  ionViewDidEnter() {
    this.transactions = [];
    this.presentLoading('Loading Transactions');
    this.loadTransactions();

  }

  loadTransactions() {
    this.isLoading = true;
    let subscription: Subscription = this.service.getMyTransactions(window.localStorage.getItem(Constants.KEY_TOKEN), this.profile.id, this.pageNo).subscribe(res => {
      // console.log(res);
      let trans: Array<Transactions> = res.data;
      this.allDone = (!trans || !trans.length);
      this.transactions = this.transactions.concat(trans);
      if (this.infiniteScroll) this.infiniteScroll.complete();
      this.isLoading = false;
      this.dismissLoading();
    }, err => {
      console.log('reviews', err);
      this.dismissLoading();
      if (this.infiniteScroll) this.infiniteScroll.complete();
      this.isLoading = false;
    });
    this.subscriptions.push(subscription);
  }

  doInfinite(infiniteScroll: any) {
    this.infiniteScroll = infiniteScroll;
    if (!this.allDone) {
      this.pageNo = this.pageNo + 1;
      this.loadTransactions();
    } else {
      infiniteScroll.complete();
    }
  }

  ionViewWillLeave() {
    this.subscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
    this.dismissLoading();
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

  private presentErrorAlert(title: string, msg: string) {
    let alert = this.alertCtrl.create({
      title: title,
      subTitle: msg,
      buttons: ["Dismiss"]
    });
    alert.present();
  }

}
