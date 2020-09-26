import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AllreviewPage } from '../allreview/allreview';
import { Constants } from '../../models/constants.models';
import { ClientService } from '../../providers/client.service';
import { Rating } from '../../models/rating.models';
import { RatingSummary } from '../../models/rating-summary.models';
import { Profile } from '../../models/profile.models';
import { User } from '../../models/user.models';

@Component({
  selector: 'page-review',
  templateUrl: 'review.html',
  providers: [ClientService]
})
export class ReviewPage {
  private profile: Profile;
  private rating: Rating;
  private role: string;
  private user: User;

  constructor(private navCtrl: NavController, private service: ClientService) {
    this.rating = JSON.parse(window.localStorage.getItem(Constants.KEY_RATING_SUMMARY));
    if (!this.rating) this.rating = Rating.getDefault();
    this.profile = JSON.parse(window.localStorage.getItem(Constants.KEY_PROFILE));
    this.role = JSON.parse(window.localStorage.getItem(Constants.KEY_ROLE));
    this.user = JSON.parse(window.localStorage.getItem(Constants.KEY_USER));
  }

  ionViewDidEnter() {
    setTimeout(() => {
      if (this.profile) {
        this.service.getRatings(window.localStorage.getItem(Constants.KEY_TOKEN), this.profile.id).subscribe(res => {
          let ratingSummaries = RatingSummary.defaultArray();
          for (let ratingSummaryResult of res.summary) {
            ratingSummaries[ratingSummaryResult.rounded_rating - 1].total = ratingSummaryResult.total;
            ratingSummaries[ratingSummaryResult.rounded_rating - 1].percent = ((ratingSummaryResult.total / res.total_ratings) * 100);
          }
          res.summary = ratingSummaries;
          this.rating = res;
          window.localStorage.setItem(Constants.KEY_RATING_SUMMARY, JSON.stringify(res));
        }, err => {
          console.log('rating_err', err);
        });
      }
    }, 1000);
  }

  allreview() {
    this.navCtrl.push(AllreviewPage);
  }

}
