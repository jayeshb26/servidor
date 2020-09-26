import { Profile } from '../../models/profile.models';
import { Component } from '@angular/core';
import { NavController, NavParams, Loading, LoadingController, AlertController, Events, ToastController } from 'ionic-angular';
import { ChatscreenPage } from '../chatscreen/chatscreen';
import { Appointment } from '../../models/appointment.models';
import { ClientService } from '../../providers/client.service';
import { Subscription } from 'rxjs/Subscription';
import { Constants } from '../../models/constants.models';
import { User } from '../../models/user.models';
import { Chat } from '../../models/chat.models';
import { Helper } from '../../models/helper.models';
import { TranslateService } from '@ngx-translate/core';
import { Diagnostic } from '@ionic-native/diagnostic';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import { MyLocation } from '../../models/my-location.models';
import { CallNumber } from '@ionic-native/call-number';
import * as firebase from 'firebase/app';
import { Payment } from '../../models/payment.models';

@Component({
  selector: 'page-booking',
  templateUrl: 'booking.html',
  providers: [ClientService]
})
export class BookingPage {
  private appointment: Appointment;
  private serviceman: Array<Profile> = [];
  private loading: Loading;
  private isLoading = false;
  private loadingShown = false;
  private statusLevel = 1;
  private statusText = "Job Pending";
  private statusLevel1Time: string;
  private statusLevel2Time: string;;
  private statusLevel3Time: string;
  private subscriptions: Array<Subscription> = [];
  private geoSubscription: Subscription;
  private role: string;
  private serviceman_id: number;
  private refresher: any;
  private reasonsLoaded: boolean = false;
  private reasons: any;
  private reason: string;
  private extraTotal: number;
  private appointment_id: number;

  constructor(private navCtrl: NavController, navParam: NavParams, private service: ClientService, private events: Events,
    private loadingCtrl: LoadingController, private geolocation: Geolocation, private callNumber: CallNumber,
    private translate: TranslateService, private diagnostic: Diagnostic, private alertCtrl: AlertController, 
    private toastCtrl: ToastController) {
    this.role = JSON.parse(window.localStorage.getItem(Constants.KEY_ROLE));

    this.appointment = navParam.get("appointment");
    if(this.appointment) {
      this.appointment_id = this.appointment.id;
      
      events.subscribe("refresh:appointmentRefId"+this.appointment.id, () => {
        console.log('refresh:appointmentRefId'+this.appointment.id);
        this.doRefreshManual(this.appointment.id);
      });
      window.localStorage.setItem("appointmentRefId"+this.appointment.id, 'true');

      this.setStatus();
      this.totalWithExtra();
    } else {
      this.appointment_id = navParam.get("appointment_id");
      events.subscribe("refresh:appointmentRefId"+this.appointment_id, () => {
        console.log('refresh:appointmentRefId'+this.appointment_id);
        this.doRefreshManual(this.appointment_id);
      });
      this.doRefreshManual(this.appointment_id);
    }
    // this.setStatus();
    // this.totalWithExtra();
    // console.log(this.role);
  }

  cancelJob() {
    if(this.reasonsLoaded) {
      this.loadReasonAlert();
    } else {
      this.loadReasons();
    }
  }

  totalWithExtra() {
    if(this.appointment.e_status != 'pending')
      this.extraTotal = Number(this.appointment.total) + Number(this.appointment.e_amount);
  }

  loadReasonAlert() {
    let alert = this.alertCtrl.create({
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: data => {
            // console.log('Cancel clicked');
          }
        },
        {
          text: 'Confirm',
          handler: data => {
            if(typeof data!='undefined' && data){
              // console.log(data);
              this.reason = data;
              this.translate.get('just_moment').subscribe(value => {
                this.presentLoading(value);
              });
              this.subscriptions.push(this.service.appointmentCancel(window.localStorage.getItem(Constants.KEY_TOKEN), this.appointment.id, this.reason).subscribe(res => {
                // console.log(res);
                this.dismissLoading();
                this.appointment = res;
                this.setStatus();
                this.events.publish("refresh:appointments");
              }, err => {
                // console.log('cancel_err', err);
                this.dismissLoading();
              }));
            } else {
              this.showToast('Please select reason to cancel order!');
            }
          }
        }
      ]
    });
    alert.setTitle('Select Reason');
    for (let i = 0; i < this.reasons.length; i++) {
      let check;
      i == 0 ? check = true : check = false;
      alert.addInput({
        type: 'radio',
        label: this.reasons[i].reason,
        value: this.reasons[i].reason,
        name: 'reason'
      });
    }
    alert.present();
  }

  loadReasons() {
    this.translate.get('just_moment').subscribe(value => {
      this.presentLoading(value);
    });
    this.subscriptions.push(this.service.loadCancelationReasons(window.localStorage.getItem(Constants.KEY_TOKEN)).subscribe(res => {
      // console.log(res);
      this.dismissLoading();
      this.reasonsLoaded = true;
      this.reasons = res;
      this.loadReasonAlert();
    }, err => {
      // console.log('cancel_err', err);
      this.dismissLoading();
    }));
  }

  checkServiceMan() {
    // console.log(this.appointment.status);
    if(this.appointment.status == "accepted" && this.role == "vendor") {
      this.translate.get('Please wait..').subscribe(value => {
        this.presentLoading(value);
      });
      let subscription: Subscription = this.service.getServiceMan(window.localStorage.getItem(Constants.KEY_TOKEN)).subscribe(res => {
        console.log(res);
        this.serviceman = res;
        this.dismissLoading();
      }, err => {
        console.log('no_service_man', err);
        this.dismissLoading();
        this.presentErrorAlert('Alert', 'No Service man found!');
      });
      this.subscriptions.push(subscription);
    }
  }

  doRefresh(refresher) {
    if (this.isLoading) refresher.complete();
    this.refresher = refresher;

    let car = new Payment();
    car.id = this.appointment.id;
    let subscription: Subscription = this.service.getAppointment(window.localStorage.getItem(Constants.KEY_TOKEN), car).subscribe(res => {
      // console.log(res);
      this.dismissLoading();
      this.appointment = res.appointment;
      // let locale = Helper.getLocale();
      // this.appointment.date_formatted = Helper.formatTimestampDate(this.appointment.date, locale);
      // this.appointment.time_from_formatted = this.appointment.time_from.substr(0, this.appointment.time_from.lastIndexOf(":"));
      // this.appointment.time_to_formatted = this.appointment.time_to.substr(0, this.appointment.time_to.lastIndexOf(":"));
      // this.appointment.total = "Rs. " + this.appointment.total;
      if (this.refresher) this.refresher.complete();
      this.setStatus();
      this.totalWithExtra();
      this.events.publish("refresh:appointments");
    }, err => {
      // console.log('update_status', err);
      if (this.refresher) this.refresher.complete();
      this.dismissLoading();
    });
    this.subscriptions.push(subscription);
  }

  doRefreshManual(id:number) {
    this.presentLoading('Loading..');

    let car = new Payment();
    car.id = id;
    let subscription: Subscription = this.service.getAppointment(window.localStorage.getItem(Constants.KEY_TOKEN), car).subscribe(res => {
      // console.log(res);
      this.dismissLoading();
      this.appointment = res.appointment;
      this.setStatus();
      this.totalWithExtra();
      this.events.publish("refresh:appointments");
    }, err => {
      this.dismissLoading();
    });
    this.subscriptions.push(subscription);
  }

  ionViewWillLeave() {
    this.subscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
    this.events.unsubscribe("refresh:appointmentRefId"+this.appointment_id);
    // window.localStorage.setItem("appointmentRefId"+this.appointment.id, 'false');
    window.localStorage.removeItem("appointmentRefId"+this.appointment.id);
    if (this.geoSubscription) {
      this.geoSubscription.unsubscribe();
      this.geoSubscription = null;
    }
    this.dismissLoading();
  }

  ionViewDidEnter() {
    if (status == "onway") {
      this.checkAndWatchLocation();
    } else if (this.geoSubscription) {
      this.geoSubscription.unsubscribe();
      this.geoSubscription = null;
    }
  }

  updateJobStatusReached(status) {
    // console.log(status);
    let alert = this.alertCtrl.create({
      title: 'Confirm Unique Code',
      message: 'Ask Servidor User for Unique Code.',
      inputs: [
        {
          name: 'ucode',
          type: 'number'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
            // console.log('Cancel clicked');
          }
        },
        {
          text: 'Confirm',
          handler: data => {
            if (data.ucode != this.appointment.code) {
              this.showToast('Unique Code is incorrect!');
            } else {
              this.updateJobStatus(status);
            }
          }
        }
      ]
    });
    alert.present();
  }

  updateJobStatusExtend(status) {
    let alert = this.alertCtrl.create({
      title: 'Extend Work',
      // message: 'Ask Servidor User for Unique Code.',
      inputs: [
        {
          name: 'extend_reason',
          type: 'text',
          placeholder: 'Enter Extend Reason'
        },
        {
          name: 'extend_days',
          type: 'number',
          placeholder: 'Enter Extend Days'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
            // console.log('Cancel clicked');
          }
        },
        {
          text: 'Confirm',
          handler: data => {
            if (data.extend_reason.length == 0) {
              this.showToast('Give proper reason!');
            } else if (data.extend_days == 0) {
              this.showToast('Days must be more than 0!');
            } else {
              this.presentLoading('Please wait..');
              let subscription: Subscription = this.service.extendAppointmentTime(window.localStorage.getItem(Constants.KEY_TOKEN), { days: data.extend_days, detail: data.extend_reason, id: this.appointment.id }).subscribe(res => {
                this.dismissLoading();
                this.appointment = res;
                this.setStatus();
                this.totalWithExtra();
                this.events.publish("refresh:appointments");
              }, err => {
                console.log('update_status', err);
                this.dismissLoading();
              });
            }
          }
        }
      ]
    });
    alert.present();
  }

  updateJobStatusCompleted(status) {
    if(this.appointment.payment.method) {
      let method: string = '';
      if(this.appointment.payment.method == 'cos') {
        method = 'COS (Cash On Service) Payment Method ?';
      } else {
        method = 'Online Payment Method ?';
      }

      let totalX: number = 0;
      if(this.appointment.e_status != 'pending') {
        totalX = Number(this.appointment.total) + Number(this.appointment.e_amount);
      } else {
        totalX = Number(this.appointment.total);
      }

      let msgs: string = '<b>Rs.' + totalX + '</b> amount is paid by the SERVIDOR USER via <b>' + method+'</b>';
      let alert = this.alertCtrl.create({
        title: 'Confirm Payment',
        message: msgs,
        buttons: [
          {
            text: 'No',
            role: 'cancel',
            handler: data => {
            }
          },
          {
            text: 'Yes',
            handler: data => {
              this.updateJobStatus(status);
            }
          }
        ]
      });
      alert.present();
    } else {
      this.showToast('Please inform Servidor User to select payment method and pay applicable amount!');
    }
  }

  addExtraPayment() {
    let alert = this.alertCtrl.create({
      title: 'Extra Work Payment',
      inputs: [
        {
          name: 'detail',
          placeholder: 'Enter Detail'
        },
        {
          name: 'amount',
          placeholder: 'Enter Amount',
          type: 'number'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
          }
        },
        {
          text: 'Yes',
          handler: data => {
            // this.updateJobStatus(status);
            // console.log(data.amount);
            // console.log(data.detail);

            if(data.amount == 0) {
              this.showToast('Amount must be more then 0!');
            } else if(!data.detail.length) {
              this.showToast('Detail field must not be blank!');
            } else {
              this.presentLoading('Please wait..');
              let subscription: Subscription = this.service.makeExtraPayment(window.localStorage.getItem(Constants.KEY_TOKEN), { amount: data.amount, detail: data.detail, id: this.appointment.id }).subscribe(res => {
                this.dismissLoading();
                this.appointment = res;
                this.setStatus();
                this.totalWithExtra();
                this.events.publish("refresh:appointments");
              }, err => {
                console.log('update_status', err);
                this.dismissLoading();
              }); 
            }
          }
        }
      ]
    });
    alert.present();
  }

  editExtraPayment() {
    let alert = this.alertCtrl.create({
      title: 'Edit Extra Work Payment',
      inputs: [
        {
          name: 'amount',
          placeholder: 'Enter Amount',
          type: 'number'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
          }
        },
        {
          text: 'Yes',
          handler: data => {
            // this.updateJobStatus(status);
            // console.log(data.amount);
            // console.log(data.detail);

            if(data.amount == 0) {
              this.showToast('Amount must be more then 0!');
            } else {
              this.presentLoading('Please wait..');
              let subscription: Subscription = this.service.updateExtraPayment(window.localStorage.getItem(Constants.KEY_TOKEN), { amount: data.amount, id: this.appointment.id }).subscribe(res => {
                this.dismissLoading();
                this.appointment = res;
                this.setStatus();
                this.totalWithExtra();
                this.events.publish("refresh:appointments");
              }, err => {
                console.log('update_status', err);
                this.dismissLoading();
              }); 
            }
          }
        }
      ]
    });
    alert.present();
  }

  updateJobStatus(status) {
    if (status == "onway") {
      this.checkAndWatchLocation();
    } else if (this.geoSubscription) {
      this.geoSubscription.unsubscribe();
      this.geoSubscription = null;
    }
    this.translate.get('updating').subscribe(value => {
      this.presentLoading(value);
    });
    let subscription: Subscription = this.service.appointmentUpdate(window.localStorage.getItem(Constants.KEY_TOKEN), this.appointment.id, status).subscribe(res => {
      this.dismissLoading();
      this.appointment = res;
      this.setStatus();
      this.totalWithExtra();
      this.events.publish("refresh:appointments");
      if(status == "accepted" && this.role == 'vendor') {
        let subscription: Subscription = this.service.getServiceMan(window.localStorage.getItem(Constants.KEY_TOKEN)).subscribe(res => {
          // console.log(res);
          this.serviceman = res;
        }, err => {
            console.log('no_service_man', err);
            this.dismissLoading();
            this.presentErrorAlert('Alert', 'No Service man found!');
        });
        this.subscriptions.push(subscription);
      }
    }, err => {
      console.log('update_status', err);
      this.dismissLoading();
      if (err && err.status && err.status == 403) {
        this.translate.get(['err_quota_title', 'err_quota_message']).subscribe(text => {
          this.presentErrorAlert(text['err_quota_title'], text['err_quota_message']);
        });
      }
    });
    this.subscriptions.push(subscription);
  }
  
  onSelectServiceMan() {
    console.log(this.serviceman_id);
  }

  checkAndWatchLocation() {
    this.diagnostic.isLocationEnabled().then((isAvailable) => {
      if (isAvailable) {
        this.watchLocation();
      } else {
        this.alertLocationServices();
      }
    }).catch((e) => {
      console.error(e);
      this.alertLocationServices();
    });
  }

  navigate() {
    if (this.appointment.address.latitude && this.appointment.address.longitude)
      window.open("http://maps.google.com/maps?q=loc:" + this.appointment.address.latitude + "," + this.appointment.address.longitude + " (Appointment)", "_system");
  }

  setStatus() {
    // console.log(this.appointment.status);
    if (this.appointment) {
      switch (this.appointment.status) {
        case "pending": {
          this.statusLevel = 1;
          this.translate.get('job_confirmed').subscribe(value => {
            this.statusText = value;
          });
          break;
        }
        case "accepted": {
          this.statusLevel = 2;
          this.translate.get('job_accepted').subscribe(value => {
            this.statusText = value;
          });
          break;
        }
        case "onway": {
          this.statusLevel = 3;
          this.translate.get('job_onway').subscribe(value => {
            this.statusText = value;
          });
          break;
        }
        case "reached": {
          this.statusLevel = 4;
          this.translate.get('job_reached').subscribe(value => {
            this.statusText = value;
          });
          break;
        }
        case "ongoing": {
          this.statusLevel = 5;
          this.translate.get('job_ongoing').subscribe(value => {
            this.statusText = value;
          });
          break;
        }
        case "extended": {
          this.statusLevel = 5;
          this.translate.get('job_complete').subscribe(value => {
            this.statusText = value;
          });
          break;
        }
        case "complete": {
          this.statusLevel = 6;
          this.translate.get('job_complete').subscribe(value => {
            this.statusText = value;
          });
          break;
        }
        case "cancelled": {
          this.statusLevel = 1;
          this.translate.get('job_cancelled').subscribe(value => {
            this.statusText = value;
          });
          break;
        }
        case "rejected": {
          this.statusLevel = 1;
          this.translate.get('job_rejected').subscribe(value => {
            this.statusText = value;
          });
          break;
        }
      }
      let acceptedTime = Helper.getLogTimeForStatus("accepted", this.appointment.logs);
      if (acceptedTime && acceptedTime.length) {
        this.translate.get('job_accepted_on').subscribe(value => {
          this.statusLevel1Time = value + acceptedTime;
        });
      }
      if (!this.statusLevel1Time || !this.statusLevel1Time.length) {
        if (this.appointment.status == "cancelled") {
          this.translate.get('job_cancelled_on').subscribe(value => {
            this.statusLevel1Time = value + Helper.formatTimestampDateTime(this.appointment.updated_at, Helper.getLocale());
          });
        } else if (this.appointment.status == "rejected") {
          this.translate.get('job_rejected_on').subscribe(value => {
            this.statusLevel1Time = value + Helper.formatTimestampDateTime(this.appointment.updated_at, Helper.getLocale());
          });
        } else {
          this.statusLevel1Time = this.appointment.updated_at;
        }
      }
      this.translate.get('job_started_on').subscribe(value => {
        let onwaytime = Helper.getLogTimeForStatus("onway", this.appointment.logs);
        if (onwaytime && onwaytime.length) {
          this.statusLevel2Time = value + onwaytime;
        } else {
          this.statusLevel2Time = value + Helper.getLogTimeForStatus("ongoing", this.appointment.logs);
        }
      });
      this.translate.get('job_completed_on').subscribe(value => {
        this.statusLevel3Time = value + Helper.getLogTimeForStatus("complete", this.appointment.logs);
      });
      // console.log(this.appointment.logs);
      this.checkServiceMan();
    }
  }

  callUser() {
    this.callNumber.callNumber(this.appointment.user.mobile_number, true).then(res => console.log('Launched dialer!', res)).catch(err => console.log('Error launching dialer', err));
  }

  chatscreen() {
    let newUserMe: User = JSON.parse(window.localStorage.getItem(Constants.KEY_USER));
    let chat = new Chat();
    chat.chatId = this.appointment.user.id + "hc";
    chat.chatImage = (this.appointment.user.image_url && this.appointment.user.image_url.length) ? this.appointment.user.image_url : "assets/imgs/empty_dp.png";
    chat.chatName = this.appointment.user.name;
    chat.chatStatus = this.appointment.user.email;
    chat.myId = newUserMe.id + "hp";
    this.navCtrl.push(ChatscreenPage, { chat: chat });
  }

  watchLocation() {
    this.geoSubscription = this.geolocation.watchPosition().subscribe(position => {
      if ((position as Geoposition).coords != undefined) {
        var geoposition = (position as Geoposition);
        console.log('Latitude: ' + geoposition.coords.latitude + ' - Longitude: ' + geoposition.coords.longitude);
        let location = new MyLocation();
        location.lat = String(geoposition.coords.latitude);
        location.lng = String(geoposition.coords.longitude);
        window.localStorage.setItem(Constants.KEY_LOCATION, JSON.stringify(location));
        let refLocation = firebase.database().ref().child("handyman_provider").child(String(this.appointment.provider.user_id));
        refLocation.set(location, function (error) {
          if (error) {
            console.log(error);
          }
        });
      } else {
        var positionError = (position as any);
        console.log('Error ' + positionError.code + ': ' + positionError.message);
      }
    });
  }

  alertLocationServices() {
    this.translate.get(['location_services_title', 'location_services_message', 'okay']).subscribe(text => {
      let alert = this.alertCtrl.create({
        title: text['location_services_title'],
        subTitle: text['location_services_message'],
        buttons: [{
          text: text['okay'],
          role: 'cancel',
          handler: () => {
            console.log('okay clicked');
          }
        }]
      });
      alert.present();
    })
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

  showToast(message: string) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'bottom'
    });
    toast.onDidDismiss(() => {
      // console.log('Dismissed toast');
    });
    toast.present();
  }

}
