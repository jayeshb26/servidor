import { Component } from '@angular/core';
import { NavController, Loading, NavParams, LoadingController, ToastController, AlertController } from 'ionic-angular';
import { ClientService } from '../../providers/client.service';
import { SignUpRequest } from '../../models/signup-request.models';
import { OtpPage } from '../otp/otp';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html',
  providers: [ClientService]
})
export class SignupPage {
  private loading: Loading;
  private loadingShown: Boolean = false;
  private signUpRequest = new SignUpRequest('', '', '', '');
  private countries: any;
  private phoneNumber: string;
  private countryCode: string = '91';
  private phoneNumberFull: string;
  private urole: string;

  constructor(params: NavParams, private navCtrl: NavController, private clientService: ClientService, private translate: TranslateService,
    private loadingCtrl: LoadingController, private toastCtrl: ToastController, private alertCtrl: AlertController) {
    let code = params.get('code');
    let phone = params.get('phone');
    let name = params.get('name');
    let email = params.get('email');
    this.urole = params.get('urole');
    if (code && code.length) {
      this.countryCode = code;
    }
    if (phone && phone.length) {
      this.phoneNumber = phone;
    }
    if (name && name.length) {
      this.signUpRequest.name = name;
    }
    if (email && email.length) {
      this.signUpRequest.email = email;
    }
    this.getCountries();
  }

  getCountries() {
    this.clientService.getCountries().subscribe(data => {
      this.countries = data;
    }, err => {
      console.log(err);
    })
  }

  requestSignUp() {
    var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
    if (!this.signUpRequest.name.length) {
      this.translate.get('err_valid_name').subscribe(value => {
        this.showToast(value);
      });
    // } else if (this.signUpRequest.email.length <= 5 || !reg.test(this.signUpRequest.email)) {
    //   this.translate.get('err_valid_email').subscribe(value => {
    //     this.showToast(value);
    //   });
    } else if (!this.countryCode || !this.countryCode.length || !this.phoneNumber || !this.phoneNumber.length) {
      this.translate.get('err_valid_phone').subscribe(value => {
        this.showToast(value);
      });
    } else {
      this.signUpRequest.password = String(Math.floor(100000 + Math.random() * 900000));
      this.phoneNumberFull = this.phoneNumber;
      this.signUpRequest.mobile_number = this.phoneNumberFull;
      this.signUp();
    }
  }

  alertPhone() {
    this.translate.get(['alert_phone', 'no', 'yes']).subscribe(text => {
      this.phoneNumberFull = this.phoneNumber;
      let alert = this.alertCtrl.create({
        title: this.phoneNumberFull,
        message: text['alert_phone'],
        buttons: [{
          text: text['no'],
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: text['yes'],
          handler: () => {
            this.signUpRequest.password = String(Math.floor(100000 + Math.random() * 900000));
            this.signUpRequest.mobile_number = this.phoneNumberFull;
            this.signUp();
          }
        }]
      });
      alert.present();
    });
  }

  signUp() {
    this.translate.get('signing_up').subscribe(value => {
      this.presentLoading(value);
    });
    this.signUpRequest.role = this.urole;
    this.clientService.signUp(this.signUpRequest).subscribe(res => {
      console.log(res);
      this.dismissLoading();
      this.navCtrl.setRoot(OtpPage, { phoneNumberFull: this.phoneNumber, urole: this.urole });
    }, err => {
      console.log(err);
      this.dismissLoading();
      let errMsg = 'Unable to register with provided credentials, Either email or phone is already taken.';
      if (err && err.error && err.error.errors) {
        if (err.error.errors.email) {
          errMsg = err.error.errors.email[0];
        } else if (err.error.errors.mobile_number) {
          errMsg = err.error.errors.mobile_number[0];
        } else if (err.error.errors.password) {
          errMsg = err.error.errors.password[0];
        }
      }
      this.presentErrorAlert(errMsg);
    });
  }

  private showToast(message: string) {
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

  private presentErrorAlert(msg: string) {
    let alert = this.alertCtrl.create({
      title: "Error",
      subTitle: msg,
      buttons: ["Dismiss"]
    });
    alert.present();
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
