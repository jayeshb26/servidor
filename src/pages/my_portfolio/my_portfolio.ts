import { Component } from '@angular/core';
import { NavController, Loading, LoadingController, ToastController, AlertController } from 'ionic-angular';
import { Upload_portfolioPage } from '../upload_portfolio/upload_portfolio';
import { ClientService } from '../../providers/client.service';
import { Subscription } from 'rxjs/Subscription';
import { ProviderPortfolio } from '../../models/provider-portfolio.models';
import { TranslateService } from '@ngx-translate/core';
import { Constants } from '../../models/constants.models';
import { Helper } from '../../models/helper.models';
import { InAppBrowser } from '@ionic-native/in-app-browser';

@Component({
  selector: 'page-my_portfolio',
  templateUrl: 'my_portfolio.html',
  providers: [ClientService]
})
export class My_portfolioPage {
  private loading: Loading;
  private loadingShown: Boolean = false;
  private isLoading = true;
  private subscriptions: Array<Subscription> = [];
  private portfolios: Array<ProviderPortfolio> = [];

  constructor(private navCtrl: NavController, private service: ClientService, private toastCtrl: ToastController, private iab: InAppBrowser,
    private loadingCtrl: LoadingController, private translate: TranslateService, private alertCtrl: AlertController) {
    this.translate.get('loading_portfolio').subscribe(value => {
      this.presentLoading(value);
    });
  }

  ionViewDidEnter() {
    this.loadPortfolio();
  }

  loadPortfolio() {
    this.isLoading = true;
    let subscription: Subscription = this.service.getMyPortfolio(window.localStorage.getItem(Constants.KEY_TOKEN)).subscribe(res => {
      this.dismissLoading();
      this.portfolios = res;
      this.isLoading = false;
    }, err => {
      console.log('reviews', err);
      this.dismissLoading();
      this.isLoading = false;
    });
    this.subscriptions.push(subscription);
  }

  deletePortfolio(portfolio) {
    this.translate.get(['delete_folio_title', 'delete_folio_message', 'no', 'yes']).subscribe(text => {
      let alert = this.alertCtrl.create({
        title: text['delete_folio_title'],
        message: text['delete_folio_message'],
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
            this.translate.get('just_moment').subscribe(value => {
              this.presentLoading(value);
            });
            let subscription: Subscription = this.service.deleteMyPortfolio(window.localStorage.getItem(Constants.KEY_TOKEN), portfolio.id).subscribe(res => {
              this.dismissLoading();
              this.navCtrl.pop();
            }, err => {
              console.log('deleteMyPortfolio', err);
              this.dismissLoading();
            });
            this.subscriptions.push(subscription);
          }
        }]
      });
      alert.present();
    });
  }

  linkPortfolio(portfolio) {
    if (Helper.isValidURL(portfolio.link)) {
      this.iab.create(portfolio.link);
    } else {
      this.showToast("Invalid link");
    }
  }

  ionViewWillLeave() {
    this.subscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
    this.dismissLoading();
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

  upload_portfolio() {
    this.navCtrl.push(Upload_portfolioPage);
  }
}