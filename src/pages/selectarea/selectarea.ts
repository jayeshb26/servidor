import { NavController, MenuController, ToastController } from 'ionic-angular';
import { Component, ElementRef, ViewChild, NgZone } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation';
import { GoogleMaps } from '../../providers/google-maps';
import { Constants } from '../../models/constants.models';
import { MyLocation } from '../../models/my-location.models';
import { } from '@types/googlemaps';

@Component({
  selector: 'page-selectarea',
  templateUrl: 'selectarea.html'
})
export class SelectareaPage {
  @ViewChild('map') private mapElement: ElementRef;
  @ViewChild('pleaseConnect') private pleaseConnect: ElementRef;
  private latitude: number;
  private longitude: number;
  private autocompleteService: any;
  private placesService: any;
  private query: string = '';
  private places: any = [];
  private searchDisabled: boolean;
  private saveDisabled: boolean;
  private initialized: boolean;
  private location: MyLocation;
  private marker: google.maps.Marker;
  private ignoreClick = false;

  constructor(private navCtrl: NavController, private menuCtrl: MenuController, private zone: NgZone,
    private maps: GoogleMaps, private geolocation: Geolocation, private toastCtrl: ToastController) {
    this.menuCtrl.enable(false, 'myMenu');
    this.searchDisabled = true;
    this.saveDisabled = true;
  }

  ionViewDidLoad(): void {
    if (!this.initialized) {
      let mapLoaded = this.maps.init(this.mapElement.nativeElement, this.pleaseConnect.nativeElement).then(() => {
        this.autocompleteService = new google.maps.places.AutocompleteService();
        this.placesService = new google.maps.places.PlacesService(this.maps.map);
        this.searchDisabled = false;
        this.maps.map.addListener('click', (event) => {
          if (event && event.latLng) {
            this.onMapClick(new google.maps.LatLng(event.latLng.lat(), event.latLng.lng()));
          }
        });
        this.initialized = true;
        this.detect();
      }).catch(err => {
        console.log(err);
        this.close();
      });
      mapLoaded.catch(err => {
        console.log(err);
        this.close();
      });
    }
  }

  onMapClick(pos: google.maps.LatLng) {
    if (pos && !this.ignoreClick) {
      if (!this.marker) {
        this.marker = new google.maps.Marker({ position: pos, map: this.maps.map });
        this.marker.setClickable(true);
        this.marker.addListener('click', (event) => {
          console.log("markerevent", event);
          this.showToast(this.location.name);
        });
      }
      else {
        this.marker.setPosition(pos);
      }
      this.maps.map.panTo(pos);

      let geocoder = new google.maps.Geocoder();
      let request = { location: pos };
      geocoder.geocode(request, (results, status) => {
        if (status == google.maps.GeocoderStatus.OK && results.length > 0) {
          this.saveDisabled = false;
          this.location = new MyLocation();
          this.location.name = results[0].formatted_address;
          this.location.lat = String(pos.lat());
          this.location.lng = String(pos.lng());
          this.showToast(this.location.name);
        }
      });
    }
  }

  selectPlace(place) {
    this.query = place.description;
    this.ignoreClick = true;
    setTimeout(() => {
      this.ignoreClick = false;
      console.log(this.query);
    }, 2000);
    this.places = [];
    let myLocation = new MyLocation();
    myLocation.name = place.name;
    this.placesService.getDetails({ placeId: place.place_id }, (details) => {
      this.zone.run(() => {
        myLocation.name = (details.formatted_address && details.formatted_address.length) ? details.formatted_address : details.name;
        myLocation.lat = details.geometry.location.lat();
        myLocation.lng = details.geometry.location.lng();
        this.saveDisabled = false;
        let lc = { lat: myLocation.lat, lng: myLocation.lng };
        this.maps.map.setCenter(lc);
        this.location = myLocation;
        let pos = new google.maps.LatLng(Number(lc.lat), Number(lc.lng));
        if (!this.marker)
          this.marker = new google.maps.Marker({ position: pos, map: this.maps.map });
        else
          this.marker.setPosition(pos);
        this.maps.map.panTo(pos);
      });
    });
  }

  searchPlace() {
    this.saveDisabled = true;
    if (this.query.length > 0 && !this.searchDisabled) {
      let config = {
        //types: ['geocode'],
        input: this.query
      }
      this.autocompleteService.getPlacePredictions(config, (predictions, status) => {
        if (status == google.maps.places.PlacesServiceStatus.OK && predictions) {
          this.places = [];
          predictions.forEach((prediction) => {
            this.places.push(prediction);
          });
        }
      });
    } else {
      this.places = [];
    }
  }

  detect() {
    this.geolocation.getCurrentPosition().then((position) => {
      this.onMapClick(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
    }).catch((err) => {
      console.log("getCurrentPosition", err);
      this.showToast("Location detection failed");
    });
  }

  save() {
    window.localStorage.setItem(Constants.KEY_LOCATION, JSON.stringify(this.location));
    this.close();
  }

  close() {
    this.navCtrl.pop();
  }

  showToast(message: string) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 5000,
      position: 'bottom'
    });
    toast.onDidDismiss(() => {
      console.log('Dismissed toast');
    });
    toast.present();
  }

}
