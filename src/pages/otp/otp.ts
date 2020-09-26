import { Component } from '@angular/core';
import { NavController, NavParams, Platform, Loading, AlertController, LoadingController, ToastController, App, Events } from 'ionic-angular';
import { TabsPage } from '../tabs/tabs';
import { ClientService } from '../../providers/client.service';
import { Constants } from '../../models/constants.models';
import { TranslateService } from '@ngx-translate/core';
import * as firebase from 'firebase/app';

@Component({
  selector: 'page-otp',
  templateUrl: 'otp.html',
  providers: [ClientService]
})
export class OtpPage {
  private recaptchaVerifier: firebase.auth.RecaptchaVerifier;
  private loading: Loading;
  private loadingShown: boolean = false;
  private captchanotvarified: boolean = true;
  private result: any;
  private buttonDisabled: any = true;
  private otp: any = '';
  private component: any;
  private captchaVerified: boolean = false;
  private verfificationId: any;
  private timer: any;
  private minutes: number = 0;
  private seconds: number = 0;
  private totalSeconds: number = 0;
  private intervalCalled: boolean = false;
  private dialCode: string;
  private resendCode: boolean = false;
  private otpNotSent: boolean = true;
  private phoneNumberFull: string;
  private urole: string;
  private newOtp: any = '';
  private otp11: any = '';
  private otp22: any = '';
  private otp33: any = '';
  private otp44: any = '';

  constructor(params: NavParams, private navCtrl: NavController, private platform: Platform,
    private alertCtrl: AlertController, private loadingCtrl: LoadingController, private app: App, private translate: TranslateService,
    private toastCtrl: ToastController, private clientService: ClientService, private events: Events) {
    this.phoneNumberFull = params.get('phoneNumberFull');
    this.urole = params.get('urole');
    // console.log(this.urole);
  }

  ionViewDidEnter() {
    // if (!(this.platform.is('cordova'))) {
    //   this.makeCaptcha();
    // }
    this.sendOTP();
  }

  loginUser(token) {
    this.translate.get('just_moment').subscribe(value => {
      this.presentLoading(value);
    });
    this.clientService.login({ token: this.phoneNumberFull, role: this.urole }).subscribe(res => {
      this.dismissLoading();
      window.localStorage.setItem(Constants.KEY_USER, JSON.stringify(res.user));
      window.localStorage.setItem(Constants.KEY_TOKEN, res.token);
      this.events.publish('user:login');
      this.app.getRootNav().setRoot(TabsPage);
    }, err => {
      console.log(err);
      this.dismissLoading();
      this.presentErrorAlert((err && err.error && err.error.message && String(err.error.message).toLowerCase().includes("role")) ? "User exists with different role" : "Something went wrong");
    });
  }

  otpController(event,next,prev){
    if(event.target.value.length < 1 && prev){
      prev.setFocus()
    }
    else if(next && event.target.value.length>0){
      next.setFocus();
    }
    else {
     return 0;
    }
  }

  getUserToken(user) {
    user.getIdToken(false).then(res => {
      // console.log('user_token_success', res);
      this.loginUser(res);
    }).catch(err => {
      // console.log('user_token_failure', err);
    });
  }

  sendOTP() {
    this.resendCode = false;
    this.otpNotSent = true;
    // if (this.platform.is('cordova')) {
      this.sendOtpPhone(this.phoneNumberFull);
    // } else {
    //   this.sendOtpBrowser(this.phoneNumberFull);
    // }
    if (this.intervalCalled) {
      clearInterval(this.timer);
    }
  }

  createTimer() {
    this.intervalCalled = true;
    this.totalSeconds--;
    if (this.totalSeconds == 0) {
      this.otpNotSent = true;
      this.resendCode = true;
      clearInterval(this.timer);
    } else {
      this.seconds = (this.totalSeconds % 60);
      if (this.totalSeconds >= this.seconds) {
        this.minutes = (this.totalSeconds - this.seconds) / 60
      } else {
        this.minutes = 0;
      }
    }
  }

  createInterval() {
    this.totalSeconds = 120;
    this.createTimer();
    this.timer = setInterval(() => {
      this.createTimer();
    }, 1000);
  }

  sendOtpPhone(phone) {
    this.translate.get('sending_otp').subscribe(value => {
      this.presentLoading(value);
    });
    // const component = this;
    // component.showToast("Verified Automatically");
    // component.verifyOtpPhone();

    this.clientService.login({ token: this.phoneNumberFull, role: this.urole }).subscribe(res => {
      this.dismissLoading();
      // console.log(res.otp);
      this.newOtp = res.otp;
      this.dismissLoading();
    }, err => {
      console.log(err);
      this.dismissLoading();
      this.presentErrorAlert((err && err.error && err.error.message && String(err.error.message).toLowerCase().includes("role")) ? "User exists with different role" : "Something went wrong");
    });

    // (<any>window).FirebasePlugin.verifyPhoneNumber(phone, 60, function (credential) {
    //   console.log("verifyPhoneNumber", JSON.stringify(credential));
    //   component.verfificationId = credential.verificationId ? credential.verificationId : credential;
    //   // if instant verification is true use the code that we received from the firebase endpoint, otherwise ask user to input verificationCode:
    //   //var code = credential.instantVerification ? credential.code : inputField.value.toString();
    //   if (component.verfificationId) {
    //     if (credential.instantVerification && credential.code) {
    //       component.otp = credential.code;
    //       component.showToast("Verified automatically");
    //       component.verifyOtpPhone();
    //     } else {
    //       component.translate.get("sending_otp_success").subscribe(value => {
    //         component.showToast(value);
    //       });
    //       component.otpNotSent = false;
    //       component.createInterval();
    //     }
    //   }
    //   component.dismissLoading();
    // }, function (error) {
    //   console.log("otp_send_fail", error);
    //   component.otpNotSent = true;
    //   component.resendCode = true;
    //   component.dismissLoading();
    //   component.translate.get('otp_send_fail').subscribe(value => {
    //     component.showToast(value);
    //   });
    // });
  }

  sendOtpBrowser(phone) {
    
    this.translate.get('sending_otp').subscribe(value => {
      this.presentLoading(value);
    });
    this.dismissLoading();
    const component = this;
    component.showToast("Verified Automatically");
    component.verifyOtpPhone();
    // const component = this;
    // this.dismissLoading();
    // this.presentLoading("Sending otp");
    // firebase.auth().signInWithPhoneNumber(phone, this.recaptchaVerifier).then((confirmationResult) => {
    //   console.log("otp_send_success", confirmationResult);
    //   component.otpNotSent = false;
    //   component.result = confirmationResult;
    //   component.dismissLoading();
    //   component.showToast("OTP Sent");
    //   if (component.intervalCalled) {
    //     clearInterval(component.timer);
    //   }
    //   component.createInterval();
    // }).catch(function (error) {
    //   console.log("otp_send_fail", error);
    //   component.resendCode = true;
    //   component.dismissLoading();
    //   if (error.message) {
    //     component.showToast(error.message);
    //   } else {
    //     component.showToast("OTP Sending failed");
    //   }
    // });
  }

  verify() {
    this.otpNotSent = true;
    console.log(this.otp11);
    console.log(this.otp22);
    console.log(this.otp33);
    console.log(this.otp44);

    let otpString = this.otp11 + this.otp22 + this.otp33 + this.otp44;
    console.log(otpString);
    // if (this.platform.is('cordova')) {
      if(this.newOtp == otpString) {
        this.verifyOtpPhone();
      } else {
        this.showToast('Invalid OTP! Try Again.');
      }
    // } else {
    //   this.verifyOtpBrowser();
    // }
  }

  verifyOtpPhone() {

    this.translate.get('just_moment').subscribe(value => {
      this.presentLoading(value);
    });
      
    this.clientService.verifyMobile({ mobile_number: this.phoneNumberFull }).subscribe(res => {
      this.dismissLoading();
      console.log(res);
      window.localStorage.setItem(Constants.KEY_USER, JSON.stringify(res.user));
      window.localStorage.setItem(Constants.KEY_TOKEN, res.token);
      window.localStorage.setItem(Constants.KEY_ROLE, JSON.stringify(res.role));
      this.events.publish('user:login');
      this.app.getRootNav().setRoot(TabsPage);
    }, err => {
      console.log(err);
      this.dismissLoading();
      this.presentErrorAlert("Something went wrong");
    });

    // var ss:String ='eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjQwOGUyYTQyMWViYWM4NGQ5ZTllOTcwMzM4MzljMTBhNzFmNDNhYWY3MzViNzFmMTZjNDY3OTBhNjE3Mjc3OTQ4ZjYwYzU2ODZhOWE4MzQ3In0';
    //    this.loginUser(ss); 
    // this.getUserToken(ss);
    //  this.dismissLoading();
   
    //  const credential = true;  //firebase.auth.PhoneAuthProvider.credential(this.verfificationId, this.otp);
    //  this.translate.get('verifying_otp').subscribe(value => {
    //    this.presentLoading(value);
    //  });
    // firebase.auth().signInAndRetrieveDataWithCredential(credential).then((info) => {
    //   console.log('otp_verify_success', info);
    //   this.dismissLoading();
    //   this.translate.get('verifying_otp_success').subscribe(value => {
    //     this.showToast(value);
    //   });
    //   this.getUserToken(info.user);
    // }, (error) => {
    //   console.log('otp_verify_fail', error);
    //   this.translate.get('verifying_otp_fail').subscribe(value => {
    //     this.showToast(value);
    //   });
    //   this.dismissLoading();
    // })
  }

  verifyOtpBrowser() {
    var ss:String ='eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjQwOGUyYTQyMWViYWM4NGQ5ZTllOTcwMzM4MzljMTBhNzFmNDNhYWY3MzViNzFmMTZjNDY3OTBhNjE3Mjc3OTQ4ZjYwYzU2ODZhOWE4MzQ3In0';
       this.loginUser(ss);
  }

  makeCaptcha() {
    const component = this;
    this.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
      // 'size': 'normal',
      'size': 'invisible',
      'callback': function (response) {
        component.captchanotvarified = true;
        // reCAPTCHA solved, allow signInWithPhoneNumber.
      }
    });
    this.recaptchaVerifier.render();
  }

  tabs() {
    this.navCtrl.push(TabsPage);
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

  makeExitAlert() {
    const alert = this.alertCtrl.create({
      title: 'App termination',
      message: 'Do you want to close the app?',
      buttons: [{
        text: 'Cancel',
        role: 'cancel',
        handler: () => {
          console.log('Application exit prevented!');
        }
      }, {
        text: 'Close App',
        handler: () => {
          this.platform.exitApp(); // Close this application
        }
      }]
    });
    alert.present();
  }

}

