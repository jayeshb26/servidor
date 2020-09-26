import { Component, Inject } from '@angular/core';
import { NavParams } from 'ionic-angular';
import { APP_CONFIG, AppConfig } from '../../app/app.config';

@Component({
  selector: 'page-privacy',
  templateUrl: 'privacy.html'
})
export class PrivacyPage {
  private toShow = "";
  private heading = "";

  constructor(@Inject(APP_CONFIG) private config: AppConfig, navParam: NavParams) {
    this.toShow = navParam.get("toShow");
    this.heading = navParam.get("heading");
  }
}
