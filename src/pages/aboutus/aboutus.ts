import { Component, Inject } from '@angular/core';
import { APP_CONFIG, AppConfig } from '../../app/app.config';
import { Helper } from '../../models/helper.models';

@Component({
  selector: 'page-aboutus',
  templateUrl: 'aboutus.html'
})
export class AboutusPage {
  private aboutUs = "";

  constructor(@Inject(APP_CONFIG) private config: AppConfig) {
    this.aboutUs = Helper.getSetting("about_us");
  }
}
