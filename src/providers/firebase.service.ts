import { Injectable, Inject } from '@angular/core';
import * as firebase from 'firebase';

@Injectable()
export class FirebaseClient {

    uploadBlob(blob: Blob) {
        return new Promise((resolve, reject) => {
            let storageRef = firebase.storage().ref();
            storageRef.child(new Date().getTime().toString()).put(blob).then(snapshot => {
                console.log(snapshot);
                firebase.storage().ref(snapshot.metadata.fullPath).getDownloadURL().then(url => resolve(url)).catch(err => reject(err))
            }, err => {
                reject(err);
            })
        })
    }

    uploadFile(file) {
        return new Promise((resolve, reject) => {
            let storageRef = firebase.storage().ref();
            storageRef.child(new Date().getTime().toString()).put(file).then(snapshot => {
                console.log(snapshot);
                firebase.storage().ref(snapshot.metadata.fullPath).getDownloadURL().then(url => resolve(url)).catch(err => reject(err))
            }, err => {
                reject(err);
            })
        })
    }

    uploadImage(imageURI) {
        return new Promise<any>((resolve, reject) => {
            let storageRef = firebase.storage().ref();
            let imageRef = storageRef.child('image').child('imageName');
            this.encodeImageUri(imageURI, function (image64) {
                imageRef.putString(image64, 'data_url').then(snapshot => {
                    resolve(snapshot.downloadURL)
                }, err => {
                    reject(err);
                })
            })
        });
    }

    encodeImageUri(imageUri, callback) {
        var c = document.createElement('canvas');
        var ctx = c.getContext("2d");
        var img = new Image();
        img.onload = function () {
            var aux: any = this;
            c.width = aux.width;
            c.height = aux.height;
            ctx.drawImage(img, 0, 0);
            var dataURL = c.toDataURL("image/jpeg");
            callback(dataURL);
        };
        img.src = imageUri;
    }
}