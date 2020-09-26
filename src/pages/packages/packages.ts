import { Component } from '@angular/core';
import { NavController, Loading, LoadingController } from 'ionic-angular';
import { PurchaseplanPage } from '../purchaseplan/purchaseplan';
import { ClientService } from '../../providers/client.service';
import { Subscription } from 'rxjs/Subscription';
import { Constants } from '../../models/constants.models';
import { Plan } from '../../models/plan.models';
import { TranslateService } from '@ngx-translate/core';
import { Helper } from '../../models/helper.models';
import { PlanDetail } from '../../models/plan-detail.models';

@Component({
  selector: 'page-packages',
  templateUrl: 'packages.html',
  providers: [ClientService]
})
export class PackagesPage {
  private loading: Loading;
  private loadingShown: Boolean = false;
  private subscriptions: Array<Subscription> = [];
  private plans: Array<Plan>;
  private currency: string;
  private myPlanDetail = PlanDetail.default();

  constructor(private navCtrl: NavController, private service: ClientService,
    private loadingCtrl: LoadingController, private translate: TranslateService) {
    this.currency = Helper.getSetting("currency");
    this.plans = JSON.parse(window.localStorage.getItem(Constants.KEY_PLANS));
    if (!this.plans)
      this.translate.get('loading_plans').subscribe(value => {
        this.presentLoading(value);
      });
    this.refreshPackages();
  }

  ionViewDidEnter() {
    let subscription: Subscription = this.service.planDetails(window.localStorage.getItem(Constants.KEY_TOKEN)).subscribe(res => {
      this.myPlanDetail = res;
    }, err => {
      console.log('plandetail', err);
    });
    this.subscriptions.push(subscription);
  }

  refreshPackages() {
    let subscription: Subscription = this.service.plans(window.localStorage.getItem(Constants.KEY_TOKEN)).subscribe(res => {
      for (let p of res) {
        p.priceToShow = this.currency + p.price;
      }
      this.plans = res;
      this.dismissLoading();
      window.localStorage.setItem(Constants.KEY_PLANS, JSON.stringify(res));
    }, err => {
      console.log('packageslist', err);
      this.dismissLoading();
    });
    this.subscriptions.push(subscription);
  }

  planDetail(plan) {
    this.navCtrl.push(PurchaseplanPage, { plan: plan });
  }

  ionViewWillLeave() {
    this.subscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
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

  private dismissLoading() {
    if (this.loadingShown) {
      this.loadingShown = false;
      this.loading.dismiss();
    }
  }

}
