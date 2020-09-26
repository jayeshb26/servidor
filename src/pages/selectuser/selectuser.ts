import { Component} from '@angular/core';
import { NavController, ToastController} from 'ionic-angular';
import { ClientService } from '../../providers/client.service';
import { SigninPage } from '../signin/signin';

@Component({
  selector: 'page-selectuser',
  templateUrl: 'selectuser.html',
  providers: [ClientService]
})
export class SelectuserPage {
  private utype: Number;
  constructor(private navCtrl: NavController, private toastCtrl: ToastController) {
  }

  goToSignInPage(type: string) {
    this.navCtrl.push(SigninPage, { utype: type });
  }

  commingSoon(type: string) {
    this.showToast("Comming Soon.")
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
