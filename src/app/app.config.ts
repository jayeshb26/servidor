import { InjectionToken } from "@angular/core";

export let APP_CONFIG = new InjectionToken<AppConfig>("app.config");

export interface FirebaseConfig {
	apiKey: string,
	authDomain: string,
	databaseURL: string,
	projectId: string,
	storageBucket: string,
	messagingSenderId: string,
	webApplicationId: string
}

export interface AppConfig {
	appName: string;
	apiBase: string;
	googleApiKey: string;
	stripeKey: string;
	oneSignalAppId: string;
	oneSignalGPSenderId: string;
	availableLanguages: Array<any>;
	firebaseConfig: FirebaseConfig;
}

export const BaseAppConfig: AppConfig = {
	appName: "Servidor Vendor",
	apiBase: "http://52.66.119.71/admin/public/",
	googleApiKey: "AIzaSyDmyMmgFJNgjtKSAJwp0mfhPHP-lyAbWmk",
	stripeKey: "",
	oneSignalAppId: "18666e9c-ac77-4ec2-84aa-9735eb04da86",
	oneSignalGPSenderId: "873296846338",
	availableLanguages: [{
		code: 'en',
		name: 'English'
	}, {
		code: 'ar',
		name: 'عربى'
	}, {
		code: 'it',
		name: 'Italiano'
	}, {
		code: 'pt',
		name: 'Portuguese'
	}, {
		code: 'nl',
		name: 'Nederlands'
	}, {
		code: 'es',
		name: 'Spanish'
	}],
	firebaseConfig: {
		webApplicationId: "34253863790-nnuru6q9q30h37evjisuv97mfv13rlsd.apps.googleusercontent.com",
		apiKey: "AIzaSyB6NVfMWNN-ReK2BuqlmJQ5CRksSTQApZs",
		authDomain: "servidorvendor.firebaseapp.com",
		databaseURL: "https://servidorvendor.firebaseio.com",
		projectId: "servidorvendor",
		storageBucket: "servidorvendor.appspot.com",
		messagingSenderId: "34253863790",
	},
};