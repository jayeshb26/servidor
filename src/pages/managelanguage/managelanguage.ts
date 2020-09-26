import { Component, Inject } from '@angular/core';
import { Events, App } from 'ionic-angular';
import { Constants } from '../../models/constants.models';
import { TabsPage } from '../tabs/tabs';
import { SigninPage } from '../signin/signin';
import { APP_CONFIG, AppConfig } from '../../app/app.config';

@Component({
  selector: 'page-managelanguage',
  templateUrl: 'managelanguage.html'
})
export class ManagelanguagePage {
  private defaultLanguageCode = "en";

  constructor(@Inject(APP_CONFIG) private config: AppConfig, private events: Events, private app: App) {
    let defaultLang = window.localStorage.getItem(Constants.KEY_DEFAULT_LANGUAGE);
    if (defaultLang) this.defaultLanguageCode = defaultLang;
  }

  onLanguageClick(language) {
    this.defaultLanguageCode = language.code;
  }

  languageConfirm() {
    this.events.publish('language:selection', this.defaultLanguageCode);
    window.localStorage.setItem(Constants.KEY_DEFAULT_LANGUAGE, this.defaultLanguageCode);
    let user = JSON.parse(window.localStorage.getItem(Constants.KEY_USER));
    this.app.getRootNav().setRoot(user ? TabsPage : SigninPage);
  }

}
