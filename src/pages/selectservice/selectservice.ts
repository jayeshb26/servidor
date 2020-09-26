import { Component } from '@angular/core';
import { NavController, Loading, NavParams, LoadingController, ToastController } from 'ionic-angular';
import { Category } from '../../models/category.models';
import { Subscription } from 'rxjs/Subscription';
import { ClientService } from '../../providers/client.service';
import { Constants } from '../../models/constants.models';

@Component({
  selector: 'page-selectservice',
  templateUrl: 'selectservice.html',
  providers: [ClientService]
})
export class SelectservicePage {
  private loading: Loading;
  private loadingShown: Boolean = false;
  private isLoading = true;
  private parentCategory: Category;
  private subCategories: Array<Category>;
  private subscriptions: Array<Subscription> = [];

  constructor(private navCtrl: NavController, params: NavParams, private service: ClientService,
    private loadingCtrl: LoadingController, private toastCtrl: ToastController) {
    this.parentCategory = params.get("cat");
    this.subCategories = params.get("cats");
    if (this.parentCategory) {
      if (!this.subCategories)
        this.presentLoading("Loading sub categories");
      this.loadChildCategories(this.parentCategory.id);
    }
  }

  ionViewWillLeave() {
    this.subscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
    this.dismissLoading();

    if (this.subCategories) {
      let catsSelected = new Array<Category>();
      for (let cat of this.subCategories) {
        if (cat.selected) {
          catsSelected.push(cat);
        }
      }
      window.localStorage.setItem("temp_sub_cats", JSON.stringify(catsSelected));
    }
  }

  done() {
    if (this.subCategories) {
      let catsSelected = new Array<Category>();
      for (let cat of this.subCategories) {
        if (cat.selected) {
          catsSelected.push(cat);
        }
      }
      if (catsSelected.length) {
        this.navCtrl.pop();
      } else {
        this.showToast("No services selected");
      }
    }
  }

  loadChildCategories(parentId: number) {
    this.isLoading = true;
    let subscription: Subscription = this.service.categoryChildren(window.localStorage.getItem(Constants.KEY_TOKEN), parentId).subscribe(res => {
      this.dismissLoading();
      let cats: Array<Category> = res.data;
      if (this.subCategories) {
        for (let selectedCat of this.subCategories) {
          for (let newCat of cats) {
            if (selectedCat.id == newCat.id) {
              newCat.selected = true;
              break;
            }
          }
        }
      }
      this.subCategories = cats;
      this.isLoading = false;
    }, err => {
      this.dismissLoading();
      console.log('cat_sub_err', err);
      this.isLoading = false;
    });
    this.subscriptions.push(subscription);
  }

  toggleSelection(subCat: Category) {
    subCat.selected = !subCat.selected;
    console.log('selection_toggle', subCat);
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
}
