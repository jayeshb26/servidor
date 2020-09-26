import { Component, Inject } from '@angular/core';
import { NavController, Loading, LoadingController, ToastController, AlertController, Platform, App, Events,NavParams } from 'ionic-angular';
import { SignupPage } from '../signup/signup';
import { ClientService } from '../../providers/client.service';
import { APP_CONFIG, AppConfig } from '../../app/app.config';
import { GooglePlus } from '@ionic-native/google-plus';
import { OtpPage } from '../otp/otp';
import { Constants } from '../../models/constants.models';
import { TabsPage } from '../tabs/tabs';
import { TranslateService } from '@ngx-translate/core';
import { PrivacyPage } from '../privacy/privacy';
import { Helper } from '../../models/helper.models';
import { SocialLoginRequest } from '../../models/sociallogin-request.models';

@Component({
  selector: 'page-signin',
  templateUrl: 'signin.html',
  providers: [ClientService]
})
export class SigninPage {
  private countries: any;
  private phoneNumber: string;
  private countryCode: string = '91';
  private phoneNumberFull: string;
  private loading: Loading;
  private loadingShown: Boolean = false;
  private utype: string;

  constructor(@Inject(APP_CONFIG) private config: AppConfig, private navCtrl: NavController,
    private loadingCtrl: LoadingController, private toastCtrl: ToastController,
    private alertCtrl: AlertController, private service: ClientService, private translate: TranslateService,
    private google: GooglePlus, private platform: Platform, private app: App, private events: Events, navParam: NavParams) {
    this.utype = 'provider';
    console.log(this.utype);
    //this.getCountries();
  }

  // getCountries() {
  //   this.service.getCountries().subscribe(data => {
  //     this.countries = data;
  //   }, err => {
  //     console.log(err);
  //   })
  // }

  privacy() {
    let terms: string = Helper.getSetting("terms");
    if (terms && terms.length) {
      this.translate.get('terms_conditions').subscribe(value => {
        this.navCtrl.push(PrivacyPage, { toShow: terms, heading: value });
      });
    }
  }

  alertPhone() {
    if(this.phoneNumber.length == 10) {
      this.phoneNumberFull = this.phoneNumber;
      this.checkIfExists();
    } else {
      this.showToast('Enter 10 Digit Phone Number!');
    }
    // this.translate.get(['alert_phone', 'no', 'yes']).subscribe(text => {
    //   this.phoneNumberFull = this.phoneNumber;
    //   let alert = this.alertCtrl.create({
    //     title: this.phoneNumberFull,
    //     message: text['alert_phone'],
    //     buttons: [{
    //       text: text['no'],
    //       role: 'cancel',
    //       handler: () => {
    //         // console.log('Cancel clicked');
    //       }
    //     },
    //     {
    //       text: text['yes'],
    //       handler: () => {
    //         this.checkIfExists();
    //       }
    //     }]
    //   });
    //   alert.present();
    // });
  }

  checkIfExists() {
    this.translate.get('just_moment').subscribe(value => {
      this.presentLoading(value);
      this.service.checkUser({ mobile_number: this.phoneNumberFull, role: this.utype }).subscribe(res => {
        // console.log(res);
        // console.log(this.utype);
        this.dismissLoading();
        this.app.getRootNav().setRoot(OtpPage, { phoneNumberFull: this.phoneNumberFull, urole: this.utype });
      }, err => {
        console.log(err);
        this.dismissLoading();
        this.navCtrl.push(SignupPage, { code: this.countryCode, phone: this.phoneNumber, urole: this.utype });
      });
    });
  }

  signInGoogle() {
    if (this.platform.is('cordova')) {
      this.translate.get('logging_google').subscribe(value => {
        this.presentLoading(value);
      });
      this.googleOnPhone();
    }
  }

  googleOnPhone() {
    let os = this.platform.is('ios') ? 'ios' : 'android';
    this.google.login({
      'webClientId': this.config.firebaseConfig.webApplicationId,
      'offline': false,
      'scopes': 'profile email'
    }).then(googleCredential => {
      console.log('google_success', JSON.stringify(googleCredential));
      this.translate.get('verifying_user').subscribe(value => {
        this.showToast(value);
      });
      this.service.loginSocial(new SocialLoginRequest(googleCredential.idToken, "google", os)).subscribe(res => {
        this.dismissLoading();
        if (res.user.mobile_verified == 1) {
          window.localStorage.setItem(Constants.KEY_USER, JSON.stringify(res.user));
          window.localStorage.setItem(Constants.KEY_TOKEN, res.token);
          this.events.publish('user:login');
          this.app.getRootNav().setRoot(TabsPage);
        } else {
          this.app.getRootNav().setRoot(OtpPage, { phoneNumberFull: res.user.mobile_number, urole: this.utype });
        }
      }, err => {
        this.dismissLoading();
        console.log(err);
        if (err && err.status && err.status == 404) {
          if (googleCredential.displayName && googleCredential.email) {
            this.navCtrl.push(SignupPage, { name: googleCredential.displayName, email: googleCredential.email, urole: this.utype });
          } else {
            this.navCtrl.push(SignupPage);
          }
        } else {
          this.showToast(err.error.message);
        }
      });
    }).catch(err => {
      console.log('google_fail', err);
      this.dismissLoading();
    });
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

  private presentErrorAlert(msg: string) {
    let alert = this.alertCtrl.create({
      title: "Error",
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
      console.log('Dismissed toast');
    });
    toast.present();
  }

}
