import { Component, Inject, ViewChild } from '@angular/core';
import { Platform, Nav, Events } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { SigninPage } from '../pages/signin/signin';
import { SelectuserPage } from '../pages/selectuser/selectuser';
import { ClientService } from '../providers/client.service';
import { APP_CONFIG, AppConfig } from './app.config';
import { Constants } from '../models/constants.models';
import firebase from 'firebase';
import { TabsPage } from '../pages/tabs/tabs';
import { User } from '../models/user.models';
import { OneSignal } from '@ionic-native/onesignal';
import { MyNotification } from '../models/notifications.models';
import { Globalization } from '@ionic-native/globalization';
import { TranslateService } from '../../node_modules/@ngx-translate/core';
import moment from 'moment';
import { BookingPage } from '../pages/booking/booking';
import { Appointments } from '../pages/appointments/appointments';

@Component({
  templateUrl: 'app.html',
  providers: [ClientService]
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;
  private userMe: User;
  rtlSide: string = "left";

  constructor(@Inject(APP_CONFIG) private config: AppConfig, private platform: Platform,
    private oneSignal: OneSignal, private statusBar: StatusBar, private splashScreen: SplashScreen,
    clientService: ClientService, private events: Events, private globalization: Globalization, public translate: TranslateService) {
    //window.localStorage.setItem(Constants.KEY_LOCATION, "{\"name\":\"Laxmi Nagar, New Delhi, Delhi, India\",\"lat\":28.689638299999995,\"lng\":77.29134669999996}");
    this.initializeApp();

    clientService.getSettings().subscribe(res => {
      // console.log('setting_setup_success');
      window.localStorage.setItem(Constants.KEY_SETTING, JSON.stringify(res));
    }, err => {
      console.log('setting_setup_error', err);
    });
    events.subscribe('language:selection', (language) => {
      clientService.updateUser(window.localStorage.getItem(Constants.KEY_TOKEN), { language: language }).subscribe(res => {
        console.log(res);
      }, err => {
        console.log('update_user', err);
      });
      this.globalize(language);
    });
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleLightContent();
      this.splashScreen.hide();
      firebase.initializeApp({
        apiKey: this.config.firebaseConfig.apiKey,
        authDomain: this.config.firebaseConfig.authDomain,
        databaseURL: this.config.firebaseConfig.databaseURL,
        projectId: this.config.firebaseConfig.projectId,
        storageBucket: this.config.firebaseConfig.storageBucket,
        messagingSenderId: this.config.firebaseConfig.messagingSenderId
      });
      this.statusBar.styleLightContent();
      this.userMe = JSON.parse(window.localStorage.getItem(Constants.KEY_USER));
      this.nav.setRoot(this.userMe ? TabsPage : SelectuserPage);
      this.splashScreen.hide();
      if (this.platform.is('cordova')) {
        this.initOneSignal();
      }
      let defaultLang = window.localStorage.getItem(Constants.KEY_DEFAULT_LANGUAGE);
      this.globalize(defaultLang);
    });
  }

  globalize(languagePriority) {
    this.translate.setDefaultLang("en");
    let defaultLangCode = this.config.availableLanguages[0].code;
    this.translate.use(languagePriority && languagePriority.length ? languagePriority : defaultLangCode);
    this.setDirectionAccordingly(languagePriority && languagePriority.length ? languagePriority : defaultLangCode);
    window.localStorage.setItem(Constants.KEY_LOCALE, languagePriority && languagePriority.length ? languagePriority : defaultLangCode);
  }

  setDirectionAccordingly(lang: string) {
    switch (lang) {
      case 'ar': {
        this.platform.setDir('ltr', false);
        this.platform.setDir('rtl', true);
        this.rtlSide = "right";
        break;
      }
      default: {
        this.platform.setDir('rtl', false);
        this.platform.setDir('ltr', true);
        this.rtlSide = "left";
        break;
      }
    }
    // this.translate.use('ar');
    // this.platform.setDir('ltr', false);
    // this.platform.setDir('rtl', true);
  }

  getSideOfCurLang() {
    this.rtlSide = this.platform.dir() === 'rtl' ? "right" : "left";
    return this.rtlSide;
  }

  getSuitableLanguage(language) {
    window.localStorage.setItem("locale", language);
    language = language.substring(0, 2).toLowerCase();
    console.log('check for: ' + language);
    return this.config.availableLanguages.some(x => x.code == language) ? language : 'en';
  }

  initOneSignal() {
    if (this.config.oneSignalAppId && this.config.oneSignalAppId.length && this.config.oneSignalGPSenderId && this.config.oneSignalGPSenderId.length) {
      this.oneSignal.startInit(this.config.oneSignalAppId, this.config.oneSignalGPSenderId);
      this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.Notification);
      this.oneSignal.handleNotificationReceived().subscribe((data) => {
        console.log(data);
        if(data.payload.additionalData.type == 'newjob') {
          this.events.publish("refresh:HomePage");
          this.events.publish("refresh:appointmentsPending");
        } else {
          this.events.publish("refresh:appointmentRefId"+data.payload.additionalData.appoinment_id);
          this.events.publish("refresh:appointments");
        }
      });
      this.oneSignal.handleNotificationOpened().subscribe((data) => {
        console.log(data);
        if(data.notification.payload.additionalData.type == 'newjob') {
          const check_event: string = JSON.parse(window.localStorage.getItem("appointmentsPending"));
          this.events.publish("refresh:HomePage");
          // console.log(check_event);
          if(check_event == null) {
            this.nav.push(Appointments, {type: 'pending'});
          } else {
            // console.log(check_event);
            this.events.publish("refresh:appointmentsPending");
          }
        } else {
          const check_event: string = JSON.parse(window.localStorage.getItem("appointmentRefId"+data.notification.payload.additionalData.appoinment_id));
          this.events.publish("refresh:appointments");
          // console.log(check_event);
          if(check_event == null) {
            // console.log(check_event);
            this.nav.push(BookingPage, { appointment_id: data.notification.payload.additionalData.appoinment_id });
          } else {
            // console.log(check_event);
            this.events.publish("refresh:appointmentRefId"+data.notification.payload.additionalData.appoinment_id);
          }
        }
      });
      this.oneSignal.endInit();
      // this.oneSignal.enableSound(true);
    }
  }

  // private formatDate(date: Date): string {
  //   let months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  //   return this.translate.instant(months[date.getMonth()]) + ' ' + date.getDate() + ', ' + date.getFullYear();
  // }

}
