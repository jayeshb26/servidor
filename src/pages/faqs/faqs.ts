import { Component } from '@angular/core';
import { Loading, LoadingController } from 'ionic-angular';
import { Subscription } from 'rxjs/Subscription';
import { Faq } from '../../models/faq.models';
import { ClientService } from '../../providers/client.service';
import { Constants } from '../../models/constants.models';

@Component({
  selector: 'page-faqs',
  templateUrl: 'faqs.html',
  providers: [ClientService]
})
export class FaqsPage {
  private loading: Loading;
  private loadingShown = false;
  private faqs = new Array<Faq>();
  private subscriptions: Array<Subscription> = [];
  private curFaqId;

  constructor(private service: ClientService, private loadingCtrl: LoadingController) {
    let savedFaqs: Array<Faq> = JSON.parse(window.localStorage.getItem(Constants.KEY_FAQS));
    if (savedFaqs) {
      this.faqs = savedFaqs;
    } else {
      this.presentLoading("Just a moment");
    }
    this.refreshFaqs();
  }

  ionViewWillLeave() {
    this.subscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
    this.dismissLoading();
  }

  refreshFaqs() {
    this.subscriptions.push(this.service.faqs().subscribe(res => {
      this.faqs = res;
      window.localStorage.setItem(Constants.KEY_FAQS, JSON.stringify(this.faqs));
      this.dismissLoading();
    }, err => {
      console.log('faqs', err);
      this.dismissLoading();
    }));
  }

  expandFaq(faq: Faq) {
    this.curFaqId = (this.curFaqId == faq.id) ? -1 : faq.id;
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
