import { Component } from '@angular/core';
import { NavController, Loading, LoadingController, Events, ToastController, App, NavParams } from 'ionic-angular';
import { BookingPage } from '../booking/booking';
import { Subscription } from 'rxjs/Subscription';
import { ClientService } from '../../providers/client.service';
import { Constants } from '../../models/constants.models';
import { Appointment } from '../../models/appointment.models';
import { TabsPage } from '../tabs/tabs';

@Component({
  selector: 'page-appointments',
  templateUrl: 'appointments.html',
  providers: [ClientService]
})
export class Appointments {
  private loading: Loading;
  private isLoading: boolean;
  private loadingShown: Boolean = false;
  private pageNo: number = 1;
  private refresher: any;
  private infiniteScroll: any;
  private subscriptions: Array<Subscription> = [];
  private appointments: Array<Appointment> = [];
  private type: string;

  constructor(private navCtrl: NavController, private service: ClientService, private app: App, params: NavParams,
  private loadingCtrl: LoadingController, private events: Events, private toastCtrl: ToastController) {

    this.type = params.get('type');
    this.presentLoading('Loading Appointments');
    this.loadRequests();
    window.localStorage.setItem("appointmentsPending", 'true');

    events.subscribe("refresh:appointmentsPending", () => {
      this.appointments = new Array();
      this.loadRequests();
    });

    // var myTimer = setInterval(() => {
    //   this.presentLoading('Loading Appointments');
    //   this.appointments = new Array();
    //   this.loadRequests();
    //   console.log('asasa');
    // }, 3000);
    // setInterval(() => {
    //   clearInterval(myTimer);
    // }, 15000);
  }

  doRefresh(refresher) {
    if (this.isLoading) refresher.complete();
    this.refresher = refresher;
    this.appointments = new Array();
    this.loadRequests();
  }

  loadRequests() {
    this.isLoading = true;
    let subscription: Subscription = this.service.provider_appointments(window.localStorage.getItem(Constants.KEY_TOKEN), this.type).subscribe(res => {
      let appointments: Array<Appointment> = res.data;
      this.appointments = appointments;
      this.dismissLoading();
      if (this.refresher) this.refresher.complete();
    }, err => {
      console.log('appointments', err);
      this.dismissLoading();
      if (this.refresher) this.refresher.complete();
    });
    this.subscriptions.push(subscription);
  }

  acceptApointment(ap: Appointment) {
    this.presentLoading('Confirming Appointment..');
    let subscription: Subscription = this.service.acceptApointment(window.localStorage.getItem(Constants.KEY_TOKEN), ap).subscribe(res => {
      if(res.code) {
        let appointments: Array<Appointment> = res.data;
        this.appointments = appointments;
        this.dismissLoading();
        this.showToast(res.msg);
        if(res.code == 200) {
          var myTimer = setInterval(() => {
            this.app.getRootNav().setRoot(TabsPage, {tabroot: 0});
          }, 2000);
          
          setInterval(() => {
            clearInterval(myTimer);
          }, 2100);
        }
      }
    }, err => {
      // console.log('appointments', err);
      this.showToast('Something went wrong!');
      this.dismissLoading();
    });
    this.subscriptions.push(subscription);
  }

  ionViewWillLeave() {
    this.subscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
    this.events.unsubscribe("refresh:appointmentsPending");
    // window.localStorage.setItem("appointmentRefId"+this.appointment.id, 'false');
    window.localStorage.removeItem("appointmentsPending");
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
