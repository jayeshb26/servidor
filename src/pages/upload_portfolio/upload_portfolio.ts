import { Component } from '@angular/core';
import { NavController, Loading, AlertController, LoadingController, ToastController } from 'ionic-angular';
import { ClientService } from '../../providers/client.service';
import { FirebaseClient } from '../../providers/firebase.service';
import { TranslateService } from '@ngx-translate/core';
import { Constants } from '../../models/constants.models';
import { Subscription } from 'rxjs/Subscription';
import { Helper } from '../../models/helper.models';

@Component({
  selector: 'page-upload_portfolio',
  templateUrl: 'upload_portfolio.html',
  providers: [ClientService, FirebaseClient]
})
export class Upload_portfolioPage {
  private progress: boolean;
  private loading: Loading;
  private loadingShown = false;
  private imageToUpload: string;
  private linkPortfolio: string;
  private subscriptions: Array<Subscription> = [];

  constructor(private navCtrl: NavController, private service: ClientService,
    private alertCtrl: AlertController, private loadingCtrl: LoadingController,
    private toastCtrl: ToastController, private firebaseService: FirebaseClient,
    private translate: TranslateService) { }

  ionViewWillLeave() {
    this.subscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
    this.dismissLoading();
  }

  saveFolio() {
    if (!this.imageToUpload || !this.imageToUpload.length) {
      this.translate.get('err_add_folio_image').subscribe(value => {
        this.showToast(value);
      });
    } else if (this.linkPortfolio && this.linkPortfolio.length && !Helper.isValidURL(this.linkPortfolio)) {
      this.translate.get('err_add_folio_link').subscribe(value => {
        this.showToast(value);
      });
    } else {
      this.translate.get('adding_folio_link').subscribe(value => {
        this.showToast(value);
      });
      this.subscriptions.push(this.service.addMyPortfolio(window.localStorage.getItem(Constants.KEY_TOKEN), { image_url: this.imageToUpload, link: this.linkPortfolio }).subscribe(res => {
        this.dismissLoading();
        this.navCtrl.pop();
      }, err => {
        console.log('addMyPortfolio', err);
        this.dismissLoading();
        this.navCtrl.pop();
      }));
    }
  }

  pickPicker() {
    if (this.progress)
      return;
    let fileInput = document.getElementById("portfolio-image");
    fileInput.click();
  }

  upload($event, isImage: boolean) {
    let file: File = $event.target.files[0];
    if (file) {
      if (isImage && !file.type.includes("image")) {
        this.translate.get('err_choose_image').subscribe(value => {
          this.showToast(value);
        });
        return;
      }
      this.progress = true;
      this.translate.get(isImage ? "uploading_image" : "uploading_doc").subscribe(value => {
        this.presentLoading(value);
      });
      this.firebaseService.uploadFile(file).then(url => {
        this.dismissLoading();
        this.progress = false;
        if (isImage) {
          this.imageToUpload = String(url);
        }
      }).catch(err => {
        this.dismissLoading();
        this.progress = false;
        console.log(err);
        this.translate.get("uploading_fail").subscribe(value => {
          this.presentErrorAlert(value);
        });
      })
    }
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

  private showToast(message: string) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 2500,
      position: 'bottom'
    });
    toast.onDidDismiss(() => {
      console.log('Dismissed toast');
    });
    toast.present();
  }

  private presentErrorAlert(msg: string) {
    let alert = this.alertCtrl.create({
      title: "Error",
      subTitle: msg,
      buttons: ["Dismiss"]
    });
    alert.present();
  }

}
