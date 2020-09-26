import { Component } from '@angular/core';
import { Loading, LoadingController } from 'ionic-angular';
import { ClientService } from '../../providers/client.service';
import { Subscription } from 'rxjs/Subscription';
import { Constants } from '../../models/constants.models';
import { Review } from '../../models/review.models';
import { TranslateService } from '@ngx-translate/core';
import { Profile } from '../../models/profile.models';

@Component({
  selector: 'page-allreview',
  templateUrl: 'allreview.html',
  providers: [ClientService]
})
export class AllreviewPage {
  private loading: Loading;
  private loadingShown: Boolean = false;
  private allDone: Boolean = false;
  private isLoading = true;
  private infiniteScroll: any;
  private pageNo = 1;
  private subscriptions: Array<Subscription> = [];
  private reviews: Array<Review> = [];
  private profileMe: Profile;

  constructor(private service: ClientService, private loadingCtrl: LoadingController, private translate: TranslateService) {
    this.translate.get('loading_reviews').subscribe(value => {
      this.presentLoading(value);
    });
    this.profileMe = JSON.parse(window.localStorage.getItem(Constants.KEY_PROFILE));
    this.loadReviews();
  }

  loadReviews() {
    this.isLoading = true;
    let subscription: Subscription = this.service.getMyReviews(window.localStorage.getItem(Constants.KEY_TOKEN),this.profileMe.id, this.pageNo).subscribe(res => {
      let reviews: Array<Review> = res.data;
      this.allDone = (!reviews || !reviews.length);
      this.dismissLoading();
      if (this.infiniteScroll) this.infiniteScroll.complete();
      this.reviews = this.reviews.concat(reviews);
      this.isLoading = false;
    }, err => {
      console.log('reviews', err);
      this.dismissLoading();
      if (this.infiniteScroll) this.infiniteScroll.complete();
      this.isLoading = false;
    });
    this.subscriptions.push(subscription);
  }

  doInfinite(infiniteScroll: any) {
    this.infiniteScroll = infiniteScroll;
    if (!this.allDone) {
      this.pageNo = this.pageNo + 1;
      this.loadReviews();
    } else {
      infiniteScroll.complete();
    }
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
