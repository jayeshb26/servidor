import { Appointments } from './../appointments/appointments';
import { Component } from '@angular/core';
import { Constants } from '../../models/constants.models';
import { MyNotification } from '../../models/notifications.models';
import { ClientService } from '../../providers/client.service';
import { NavController, Loading, LoadingController, Events, ToastController } from 'ionic-angular';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  providers: [ClientService]
})
export class HomePage {
  private notifications = new Array<MyNotification>();
  private role: string;
  private roleName: string;
  private todayBooking: number = 0;
  private compleBooking: number = 0;
  private unassiBooking: number = 0;
  private inprogBooking: number = 0;
  private totalBooking: number = 0;
  private todayEarning: string = '0';
  private totalEarning: string = '0';
  private inhandEarning: string = '0';
  private walletEarning: string = '0';
  private loading: Loading;
  private isLoading: boolean;
  private loadingShown: Boolean = false;
  private subscriptions: Array<Subscription> = [];
  private refresher: any;

  constructor(private navCtrl: NavController, private service: ClientService, private loadingCtrl: LoadingController, events: Events, private toastCtrl: ToastController) {
    this.role = JSON.parse(window.localStorage.getItem(Constants.KEY_ROLE));
    // console.log(this.role);
    if(this.role == "vendor") {
      this.roleName = "Vendor";
    }
    if(this.role == "v_service_man") {
      this.roleName = "Vendor Service Man";
    }
    if(this.role == "store_manager") {
      this.roleName = "Store Manager";
    }
    if(this.role == "provider") {
      this.roleName = "Service Man";
    }
    this.presentLoading('Loading Statistics');
    this.loadRequests(this.role);
    events.subscribe("refresh:HomePage", () => {
      this.presentLoading('Loading..');
      this.loadRequests(this.role);
    });
  }

  goToAppointments(types) {
    this.navCtrl.push(Appointments, {type: types});
  }

  ionViewDidEnter() {
  }

  doRefresh(refresher) {
    if (this.isLoading) refresher.complete();
    this.refresher = refresher;
    this.presentLoading('Loading Statistics');
    this.loadRequests(this.role);
  }

  loadRequests(role) {
    this.isLoading = true;
    let subscription: Subscription = this.service.provider_home(window.localStorage.getItem(Constants.KEY_TOKEN), role).subscribe(res => {

      this.todayBooking = res.data.penappcount;
      this.unassiBooking = res.data.rejappcount;
      this.inprogBooking = res.data.inprogcount;
      this.compleBooking = res.data.comappcount;
      this.totalBooking = res.data.allappcount;
      this.todayEarning = Number(res.data.todayearnings).toFixed(2);
      this.totalEarning = Number(res.data.totalearnings).toFixed(2);
      this.inhandEarning = Number(res.data.inhandearnings).toFixed(2);
      this.walletEarning = Number(res.data.walletearnings).toFixed(2);
      // this.totalEarning = res.data.totalearnings;

      this.dismissLoading();
      if (this.refresher) this.refresher.complete();
    }, err => {
      console.log('appointments', err);
      this.dismissLoading();
      if (this.refresher) this.refresher.complete();
    });
    this.subscriptions.push(subscription);
  }

  private presentLoading(message: string) {
    this.loading = this.loadingCtrl.create({
      content: message
    });
    this.loading.onDidDismiss(() => { });
    this.loading.present();
    this.loadingShown = true;
  }

  showToast(message: string) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'bottom'
    });
    toast.onDidDismiss(() => {
      console.log('Dismissed toast');
    });
    toast.present();
  }

  private dismissLoading() {
    if (this.loadingShown) {
      this.loadingShown = false;
      this.loading.dismiss();
    }
  }
}
