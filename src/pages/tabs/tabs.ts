import { ReviewPage } from './../review/review';
import { HomePage } from '../home/home';
import { Component } from '@angular/core';
import { ViewChild } from '@angular/core';
import { Platform, AlertController, App, NavParams } from 'ionic-angular'
import { RequestsPage } from '../requests/requests';
import { ServidorPage } from '../servidor/servidor';
import { AccountPage } from '../account/account';
import { Tabs, NavController } from 'ionic-angular';
import { Constants } from '../../models/constants.models';
import { MyprofilePage } from '../myprofile/myprofile';
import { OneSignal } from '@ionic-native/onesignal';
import { User } from '../../models/user.models';
import { ClientService } from '../../providers/client.service';
import { Profile } from '../../models/profile.models';
import { Diagnostic } from '@ionic-native/diagnostic';
import { TranslateService } from '@ngx-translate/core';
import { Geolocation } from '@ionic-native/geolocation';
import { ProfileUpdateRequest } from '../../models/profile-update-request.models';
import firebase from 'firebase';

@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html',
  providers: [ClientService]
})
export class TabsPage {
  @ViewChild('myTabs') tabRef: Tabs;

  tab1Root = RequestsPage;
  tab2Root = HomePage;
  tab3Root = ReviewPage;
  tab5Root = AccountPage;
  tab4Root = ServidorPage;
  private sIndex: number = 1;
  private tabroot: number;

  constructor(oneSignal: OneSignal, private navCtrl: NavController, private service: ClientService,
    platform: Platform, diagnostic: Diagnostic, private geolocation: Geolocation, params: NavParams,
    private translate: TranslateService, private alertCtrl: AlertController, private app: App) {
      
      this.tabroot = params.get('tabroot');
      // console.log(this.tabroot);
      if(!this.tabroot == null || !(typeof this.tabroot === 'undefined')) {
        this.sIndex = this.tabroot;
      }

      if (platform.is("cordova")) {
        oneSignal.getIds().then((id) => {
          if (id && id.userId) {
            let userMe: User = JSON.parse(window.localStorage.getItem(Constants.KEY_USER));
            firebase.database().ref(Constants.REF_USERS_FCM_IDS).child((userMe.id + "hp")).set(id.userId);
            let defaultLang = window.localStorage.getItem(Constants.KEY_DEFAULT_LANGUAGE);
            service.updateUser(window.localStorage.getItem(Constants.KEY_TOKEN), {
              fcm_registration_id: id.userId,
              language: (defaultLang && defaultLang.length) ? defaultLang : "en"
            }).subscribe(res => {
              console.log(res);
            }, err => {
              console.log('update_user', err);
            });
          }
        });
      }

      setTimeout(() => {
        let profile: Profile = JSON.parse(window.localStorage.getItem(Constants.KEY_PROFILE));
        let role: string = JSON.parse(window.localStorage.getItem(Constants.KEY_ROLE));
        // console.log(profile);
        // console.log(role);
        if (!profile || !profile.primary_category_id) {
          // console.log(profile);
          this.navCtrl.push(MyprofilePage, { create_edit: true });
          // this.app.getRootNav().setRoot(MyprofilePage, { create_edit: true });
        }
      }, 500);

      diagnostic.isLocationEnabled().then((isAvailable) => {
        if (isAvailable) {
          this.setLocation();
        } else {
          // this.alertLocationServices();
          // this.setLocation();
        }
      }).catch((e) => {
        console.error(e);
        // this.alertLocationServices();
        // this.setLocation();
      });

      this.refreshProfile();
  }

  refreshProfile() {
    this.service.getProfile(window.localStorage.getItem(Constants.KEY_TOKEN)).subscribe(res => {
      if (res && res.primary_category && res.primary_category_id) {
        let profile: Profile = res;
        let userMe: User = res.user;
        // console.log(res);
        window.localStorage.setItem(Constants.KEY_PROFILE, JSON.stringify(profile));
        window.localStorage.setItem(Constants.KEY_USER, JSON.stringify(userMe));
      } else {
        window.localStorage.removeItem(Constants.KEY_PROFILE);
      }
    }, err => {
      console.log('profile_get_err', err);
    });
  }

  setLocation() {
    this.geolocation.getCurrentPosition().then((position) => {
      let pur = new ProfileUpdateRequest();
      pur.longitude = String(position.coords.longitude);
      pur.latitude = String(position.coords.latitude);
      // console.log(pur);
      // this.service.updateProfile(window.localStorage.getItem(Constants.KEY_TOKEN), pur).subscribe(res => {
      //   // console.log(res);
      // }, err => {
      //   console.log('logActivity', err);
      // });
    }).catch((err) => {
      console.log("getCurrentPosition", err);
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
            // console.log('okay clicked');
          }
        }]
      });
      alert.present();
    })
  }

}
