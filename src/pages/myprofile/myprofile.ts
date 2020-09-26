// import { FileTransfer } from '@ionic-native/file-transfer/ngx';
import { Component } from '@angular/core';
import { NavController, Loading, LoadingController, ToastController, AlertController, NavParams, App, Platform } from 'ionic-angular';
import { SelectservicePage } from '../selectservice/selectservice';
import { Constants } from '../../models/constants.models';
import { User } from '../../models/user.models';
import { Profile } from '../../models/profile.models';
import { ClientService } from '../../providers/client.service';
import { Category } from '../../models/category.models';
import { Subscription } from 'rxjs/Subscription';
import { MyLocation } from '../../models/my-location.models';
import { SelectareaPage } from '../selectarea/selectarea';
import { FirebaseClient } from '../../providers/firebase.service';
import { ProfileUpdateRequest } from '../../models/profile-update-request.models';
import { TranslateService } from '@ngx-translate/core';
import { TabsPage } from '../tabs/tabs';
import { ImagePicker } from '@ionic-native/image-picker';
import { Crop } from '@ionic-native/crop';
import { File, FileEntry, Entry } from '@ionic-native/file';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { Camera, CameraOptions } from '@ionic-native/camera';

@Component({
  selector: 'page-myprofile',
  templateUrl: 'myprofile.html',
  providers: [ClientService, FirebaseClient]
})
export class MyprofilePage {
  private loading: Loading;
  private loadingShown = false;
  private selectionPagePushed = false;
  private user: User;
  private location: MyLocation;
  private profile: Profile;
  private progress: boolean;
  private categories: Array<Category>;
  private subscriptions: Array<Subscription> = [];
  private level = 0;
  private uploadType: number;
  private subcategoriestext;
  imageURI:any;
  imageFileName:any;
  mimeTypeNew: any;

  constructor(private navCtrl: NavController, private service: ClientService,
    private alertCtrl: AlertController, private loadingCtrl: LoadingController,
    private toastCtrl: ToastController, private firebaseService: FirebaseClient,
    private transfer: FileTransfer, private camera: Camera,
    private translate: TranslateService, navParam: NavParams, private app: App, private file: File,
    private imagePicker: ImagePicker, private cropService: Crop, private platform: Platform) {
    let create_edit = navParam.get("create_edit");
    if (create_edit) {
      this.translate.get('create_edit_profile').subscribe(value => {
        this.showToast(value);
      });
    }
    this.user = JSON.parse(window.localStorage.getItem(Constants.KEY_USER));
    this.profile = JSON.parse(window.localStorage.getItem(Constants.KEY_PROFILE));
    this.categories = JSON.parse(window.localStorage.getItem(Constants.KEY_CATEGORY));
    this.location = JSON.parse(window.localStorage.getItem(Constants.KEY_LOCATION));
    if (!this.categories) {
      this.translate.get('just_moment').subscribe(value => {
        this.presentLoading(value);
      });
    }
    if (!this.profile) {
      this.profile = new Profile();
      this.profile.primary_category = new Category();
      this.profile.subcategories = new Array<Category>();
      this.profile.price_type = "hour";
      this.profile.about = "";
      this.profile.user = this.user;
    }
    if (!this.profile.primary_category) {
      this.profile.primary_category = new Category();
    }
    if (!this.profile.subcategories) {
      this.profile.subcategories = new Array<Category>();
    }
    if (this.profile.subcategories) {
      let sct = "";
      for (let sc of this.profile.subcategories)
        sct += sc.title + ", ";
      this.subcategoriestext = sct.substring(0, sct.length - 2);
    }
    this.refreshProfile();
    this.refreshCategories();
  }

  ionViewDidEnter() {
    let newSelectedLocation: MyLocation = JSON.parse(window.localStorage.getItem(Constants.KEY_LOCATION));
    this.location = newSelectedLocation;
    if (this.selectionPagePushed) {
      this.selectionPagePushed = false;
      let subCategories: Array<Category> = JSON.parse(window.localStorage.getItem("temp_sub_cats"));
      window.localStorage.removeItem("temp_sub_cats");
      if (subCategories && subCategories.length) {
        this.profile.subcategories = subCategories;
      }
      if (this.profile.subcategories) {
        let sct = "";
        for (let sc of this.profile.subcategories)
          sct += sc.title + ", ";
        this.subcategoriestext = sct.substring(0, sct.length - 2);
      }
    }
    // this.profile.is_verified = 0;
  }

  refreshProfile() {
    let subscription: Subscription = this.service.getProfile(window.localStorage.getItem(Constants.KEY_TOKEN)).subscribe(res => {
      if (res && res.primary_category && res.primary_category_id) {
        this.profile = res;
        // console.log(res);
        window.localStorage.setItem(Constants.KEY_PROFILE, JSON.stringify(this.profile));
      } else {
        window.localStorage.removeItem(Constants.KEY_PROFILE);
        this.profile = new Profile();
        this.profile.primary_category = new Category();
        this.profile.subcategories = new Array<Category>();
        this.profile.price_type = "hour";
        this.profile.about = "";
        this.profile.user = this.user;
      }
    }, err => {
      console.log('profile_get_err', err);
    });
    this.subscriptions.push(subscription);
  }

  refreshCategories() {
    let subscription: Subscription = this.service.categoryParent(window.localStorage.getItem(Constants.KEY_TOKEN)).subscribe(res => {
      this.dismissLoading();
      let cats: Array<Category> = res.data;
      this.categories = cats;
      // console.log(cats);
      window.localStorage.setItem(Constants.KEY_CATEGORY, JSON.stringify(this.categories));
    }, err => {
      this.dismissLoading();
      console.log('cat_err', err);
    });
    this.subscriptions.push(subscription);
  }

  pickLocation() {
    this.navCtrl.push(SelectareaPage);
  }

  compareFn(tr1: Category, tr2: Category): boolean {
    return tr1 && tr2 ? tr1.id == tr2.id : tr1 === tr2;
  }

  selectservice() {
    if(this.profile.is_verified != 1) {
      if (this.profile.primary_category) {
        this.selectionPagePushed = true;
        if (this.profile.subcategories) {
          for (let subCat of this.profile.subcategories) {
            subCat.selected = true;
          }
        }
        this.navCtrl.push(SelectservicePage, { cat: this.profile.primary_category, cats: this.profile.subcategories });
      }
    }
  }

  chooseAction() {
    console.log(this.profile.is_verified);
    if(this.profile.is_verified != 1) {
      let alert = this.alertCtrl.create({
        buttons: [
          {
            text: 'No',
            role: 'cancel',
            handler: data => {
              // console.log('Cancel clicked');
            }
          },
          {
            text: 'Confirm',
            handler: data => {
              // console.log(data);
              this.getImage(data);
            }
          }
        ]
      });
      alert.setTitle('Options');
      alert.addInput({
        type: 'radio',
        label: 'Camera',
        value: 'camera',
        name: 'reason'
      });
      alert.addInput({
        type: 'radio',
        label: 'File',
        value: 'file',
        name: 'reason'
      });
      alert.present();
    }
  }

  getImage(str: any) {
    let options: CameraOptions = {};
    if(str == 'camera') {
      options = {
        quality: 100,
        destinationType: this.camera.DestinationType.FILE_URI,
        sourceType: this.camera.PictureSourceType.CAMERA
        // mediaType: 0
      }
    } else {
      options = {
        quality: 100,
        destinationType: this.camera.DestinationType.FILE_URI,
        sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
        mediaType: 0
      }
    }
  
    this.camera.getPicture(options).then((imageData) => {
      return this.cropService.crop(imageData, { quality: 100 }).then(cropped_image => {
        this.resolveUri(cropped_image);
      });
      // this.imageURI = imageData;
      // this.uploadFile();
    }, (err) => {
      console.log(err);
      console.log('Error Camera');
      this.showToast(err);
    });
  }

  resolveUri(uri: string) {
    // console.log('uri: ' + uri);
    if (this.platform.is("android") && uri.startsWith('content://') && uri.indexOf('/storage/') != -1) {
      uri = "file://" + uri.substring(uri.indexOf("/storage/"), uri.length);
      // console.log('file: ' + uri);
    }
    this.file.resolveLocalFilesystemUrl(uri).then((entry: Entry) => {
      // console.log(entry);
      var fileEntry = entry as FileEntry;
      fileEntry.file(success => {
        var mimeType = success.type;
        // console.log(mimeType);
        let dirPath = entry.nativeURL;    
        this.imageURI = dirPath;
        this.mimeTypeNew = mimeType;
        this.uploadFile();
        // this.upload(dirPath, entry.name, mimeType);
      }, error => {
        console.log(error);
      });
    })
  }
  
  uploadFile() {
    // console.log(this.imageURI);
    let loader = this.loadingCtrl.create({
      content: "Uploading..."
    });
    loader.present();
    // this.showToast('Uploading...');
    const fileTransfer: FileTransferObject = this.transfer.create();
  
    let options: FileUploadOptions = {
      fileName: this.imageURI,
      chunkedMode: false,
      headers: {},
      params: {
        uid : this.user.id
      }
    }

    // console.log(options);

    fileTransfer.upload(this.imageURI, 'http://52.66.119.71/admin/uploads/upload.php', options)
      .then((data) => {
      // console.log(" Uploaded Successfully");
      // console.log(data);
      this.profile.user.image_url = String(data.response);
      this.service.updateUser(window.localStorage.getItem(Constants.KEY_TOKEN), { image_url: String(data.response) }).subscribe(res => {
        console.log(res);
        window.localStorage.setItem(Constants.KEY_USER, JSON.stringify(res));
      }, err => {
        console.log('update_user', err);
      });
      loader.dismiss();
      this.showToast("Image uploaded successfully");
    }, (err) => {
      // console.log(" Uploaded Failure");
      console.log(err);
      loader.dismiss();
      // this.showToast(err);
    });
  }

  save() {
    // if (!this.location) {
    //   this.translate.get('err_select_location').subscribe(value => {
    //     this.showToast(value);
    //   });
    //   return;
    // }
    // if (!this.profile.about || !this.profile.about.length) {
    //   this.translate.get('err_empty_about').subscribe(value => {
    //     this.showToast(value);
    //   });
    //   return;
    // }
    // if (!this.profile.price || this.profile.price <= 0) {
    //   this.translate.get('err_empty_price').subscribe(value => {
    //     this.showToast(value);
    //   });
    //   return;
    // }
    // if (!this.profile.document_url || !this.profile.document_url.length) {
    //   this.translate.get('err_empty_doc').subscribe(value => {
    //     this.showToast(value);
    //   });
    //   return;
    // }
    if (!this.profile.primary_category) {
      this.translate.get('err_service_cat').subscribe(value => {
        this.showToast(value);
      });
      return;
    }
    // if (!this.profile.subcategories || !this.profile.subcategories.length) {
    //   this.translate.get('err_services').subscribe(value => {
    //     this.showToast(value);
    //   });
    //   return;
    // }

    let profileRequest = new ProfileUpdateRequest();
    profileRequest.address = 'Home';
    profileRequest.latitude = '22.821156';
    profileRequest.longitude = '74.251305';
    profileRequest.about = this.profile.about;
    profileRequest.price = this.profile.price;
    profileRequest.price_type = 'visit';
    profileRequest.document_url = 'https://i.picsum.photos/id/237/200/300.jpg';
    profileRequest.primary_category_id = this.profile.primary_category.id;
    profileRequest.sub_categories = new Array<number>();
    for (let cat of this.profile.subcategories) {
      profileRequest.sub_categories.push(cat.id);
    }

    this.translate.get('profile_updating').subscribe(value => {
      this.presentLoading(value);
    });
    console.log('update_request', profileRequest);
    let subscription: Subscription = this.service.updateProfile(window.localStorage.getItem(Constants.KEY_TOKEN), profileRequest).subscribe(res => {
      window.localStorage.setItem(Constants.KEY_PROFILE, JSON.stringify(res));
      this.dismissLoading();
      this.app.getRootNav().setRoot(TabsPage);
    }, err => {
      this.dismissLoading();
      console.log("profile_update_err", err);
      this.translate.get('profile_updating_fail').subscribe(value => {
        this.presentErrorAlert(value);
      });
    });
    this.subscriptions.push(subscription);
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

  // pickPicker(num) {
  //   if (this.progress)
  //     return;
  //   this.uploadType = num;
  //   this.platform.ready().then(() => {
  //     if (this.platform.is("cordova")) {
  //       this.imagePicker.getPictures({
  //         maximumImagesCount: 1,
  //       }).then((results) => {
  //         if (results && results[0]) {
  //           this.reduceImages(results).then(() => {
  //             // console.log('cropped_images');
  //           });
  //         }
  //       }, (err) => {
  //         console.log("getPictures", JSON.stringify(err));
  //       });
  //     } else {
  //       console.log('Open Cordova Platform!')
  //     }
  //   });
  // }

  // upload(path, name, mime) {
  //   let orignalPath = path; 
  //   console.log('original: ' + path);
  //   let dirPathSegments = path.split('/');
  //   dirPathSegments.pop();
  //   path = dirPathSegments.join('/');
  //   console.log('dir: ' + path);
  //   console.log(name);
  //   this.file.readAsArrayBuffer(path, name).then(buffer => {
  //     this.translate.get(this.uploadType == 1 ? "uploading_image" : "uploading_doc").subscribe(value => {
  //       this.presentLoading(value);
  //     });
  //     this.progress = true;
  //     this.firebaseService.uploadBlob(new Blob([buffer], { type: mime })).then(url => {
  //       this.progress = false;
  //       this.dismissLoading();
  //       console.log("Url is", url);
  //       if (this.uploadType == 1) {
  //         this.profile.user.image_url = String(url);
  //         this.service.updateUser(window.localStorage.getItem(Constants.KEY_TOKEN), { image_url: String(url) }).subscribe(res => {
  //           console.log(res);
  //           window.localStorage.setItem(Constants.KEY_USER, JSON.stringify(res));
  //         }, err => {
  //           console.log('update_user', err);
  //         });
  //       } else {
  //         this.profile.document_url = String(url);
  //         this.translate.get('document_uploaded').subscribe(value => {
  //           this.showToast(value);
  //         });
  //       }
  //     }).catch(err => {
  //       this.progress = false;
  //       this.dismissLoading();
  //       this.showToast(JSON.stringify(err));
  //       console.log(err);
  //       this.translate.get("uploading_fail").subscribe(value => {
  //         this.presentErrorAlert(value);
  //       });
  //     })
  //   }).catch(err => {
  //     this.dismissLoading();
  //     this.showToast(JSON.stringify(err));
  //     console.log(err);
  //   })
  // }

  // reduceImages(selected_pictures: any): any {
  //   return selected_pictures.reduce((promise: any, item: any) => {
  //     return promise.then((result) => {
  //       return this.cropService.crop(item, { quality: 100 }).then(cropped_image => {
  //         this.resolveUri(cropped_image);
  //       });
  //     });
  //   }, Promise.resolve());
  // }

}
