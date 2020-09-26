import { SelectuserPage } from './../selectuser/selectuser';
import { Component } from '@angular/core';
import { NavController, AlertController, App } from 'ionic-angular';
import { MyprofilePage } from '../myprofile/myprofile';
import { PackagesPage } from '../packages/packages';
import { ConatctusPage } from '../conatctus/conatctus';
import { PrivacyPage } from '../privacy/privacy';
import { AboutusPage } from '../aboutus/aboutus';
import { SigninPage } from '../signin/signin';
import { Profile } from '../../models/profile.models';
import { Constants } from '../../models/constants.models';
import { User } from '../../models/user.models';
import { Category } from '../../models/category.models';
import { TranslateService } from '@ngx-translate/core';
import { ManagelanguagePage } from '../managelanguage/managelanguage';
import { My_portfolioPage } from '../my_portfolio/my_portfolio';
import { Helper } from '../../models/helper.models';
import { FaqsPage } from '../faqs/faqs';

@Component({
  selector: 'page-account',
  templateUrl: 'account.html'
})
export class AccountPage {
  private user: User;
  private profile: Profile;

  constructor(private navCtrl: NavController, private alertCtrl: AlertController,
    private app: App, private translate: TranslateService) {
    this.profile = JSON.parse(window.localStorage.getItem(Constants.KEY_PROFILE));
    if (!this.profile) {
      this.profile = new Profile();
      this.profile.primary_category = new Category();
      this.profile.subcategories = new Array<Category>();
      this.profile.price_type = "hour";
      this.profile.about = "";
    }
    if (!this.profile.primary_category) {
      this.profile.primary_category = new Category();
    }
    if (!this.profile.subcategories) {
      this.profile.subcategories = new Array<Category>();
    }
  }

  ionViewDidEnter() {
    this.user = JSON.parse(window.localStorage.getItem(Constants.KEY_USER));
  }

  myprofile() {
    this.navCtrl.push(MyprofilePage);
  }
  packages() {
    this.navCtrl.push(PackagesPage);
  }
  conatctus() {
    this.navCtrl.push(ConatctusPage);
  }
  faqs() {
    this.navCtrl.push(FaqsPage);
  }
  privacy() {
    let terms: string = Helper.getSetting("privacy_policy");
    if (terms && terms.length) {
      this.translate.get('privacy_policy').subscribe(value => {
        this.navCtrl.push(PrivacyPage, { toShow: terms, heading: value });
      });
    }
  }
  aboutus() {
    this.navCtrl.push(AboutusPage);
  }
  chooseLanguage() {
    this.navCtrl.push(ManagelanguagePage);
  }
  my_portfolio() {
    this.navCtrl.push(My_portfolioPage);
  }

  alertLogout() {
    this.translate.get(['logout_title', 'logout_message', 'no', 'yes']).subscribe(text => {
      let alert = this.alertCtrl.create({
        title: text['logout_title'],
        message: text['logout_message'],
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
            window.localStorage.removeItem(Constants.KEY_USER);
            window.localStorage.removeItem(Constants.KEY_TOKEN);
            window.localStorage.removeItem(Constants.KEY_PROFILE);
            window.localStorage.removeItem(Constants.KEY_ROLE);
            window.localStorage.removeItem(Constants.KEY_NOTIFICATIONS);
            window.localStorage.removeItem(Constants.KEY_CARD_INFO);
            this.app.getRootNav().setRoot(SelectuserPage);
          }
        }]
      });
      alert.present();
    });
  }


}
