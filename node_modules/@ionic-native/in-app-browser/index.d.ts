import { IonicNativePlugin } from '@ionic-native/core';
import { Observable } from 'rxjs/Observable';
export interface InAppBrowserOptions {
    /** Set to yes or no to turn the InAppBrowser's location bar on or off. */
    location?: 'yes' | 'no';
    hidden?: 'yes' | 'no';
    /** Set to yes to have the browser's cookie cache cleared before the new window is opened. */
    clearcache?: 'yes';
    clearsessioncache?: 'yes';
    closebuttoncaption?: string;
    closebuttoncolor?: string;
    /** (Android Only) Set to yes to show Android browser's zoom controls, set to no to hide them. Default value is yes. */
    zoom?: 'yes' | 'no';
    hardwareback?: 'yes' | 'no';
    /** Set to yes to prevent HTML5 audio or video from autoplaying (defaults to no). */
    mediaPlaybackRequiresUserAction?: 'yes' | 'no';
    hidenavigationbuttons?: 'yes' | 'no';
    hideurlbar?: 'yes' | 'no';
    navigationbuttoncolor?: string;
    toolbarcolor?: string;
    /** (Android Only) Set to yes to make InAppBrowser WebView to pause/resume with the app to stop background audio (this may be required to avoid Google Play issues) */
    shouldPauseOnSuspend?: 'yes' | 'no';
    /** (Android Only) Set to yes to show a close button in the footer similar to the iOS Done button. The close button will appear the same as for the header hence use closebuttoncaption and closebuttoncolor to set its properties */
    footer?: 'yes' | 'no';
    /** (Android Only) Set to a valid hex color string, for example #00ff00 or #CC00ff00 (#aarrggbb), and it will change the footer color from default. Only has effect if user has footer set to yes */
    footercolor?: string;
    /** (iOS Only) Set to yes or no (default is no). Turns on/off the UIWebViewBounce property. */
    disallowoverscroll?: 'yes' | 'no';
    /** (iOS Only) Set to yes or no to turn the toolbar on or off for the InAppBrowser (defaults to yes) */
    toolbar?: 'yes' | 'no';
    /** (iOS Only) Set to yes or no to make the toolbar translucent(semi-transparent) (defaults to yes). Only applicable if toolbar is not disabled. */
    toolbartranslucent?: 'yes' | 'no';
    /** (iOS Only)  Set to yes or no to prevent viewport scaling through a meta tag (defaults to no). */
    enableViewportScale?: 'yes' | 'no';
    allowInlineMediaPlayback?: 'yes' | 'no';
    /** (iOS Only) Set to yes or no to open the keyboard when form elements receive focus via JavaScript's focus() call (defaults to yes). */
    keyboardDisplayRequiresUserAction?: 'yes' | 'no';
    /** (iOS Only) Set to yes or no to wait until all new view content is received before being rendered (defaults to no). */
    suppressesIncrementalRendering?: 'yes' | 'no';
    /** (iOS Only) Set to pagesheet, formsheet or fullscreen to set the presentation style (defaults to fullscreen). */
    presentationstyle?: 'pagesheet' | 'formsheet' | 'fullscreen';
    /** (iOS Only) Set to fliphorizontal, crossdissolve or coververtical to set the transition style (defaults to coververtical). */
    transitionstyle?: 'fliphorizontal' | 'crossdissolve' | 'coververtical';
    /** (iOS Only) Set to top or bottom (default is bottom). Causes the toolbar to be at the top or bottom of the window. */
    toolbarposition?: 'top' | 'bottom';
    /** (iOS Only) Set to yes or no to change the visibility of the loading indicator (defaults to no). */
    hidespinner?: 'yes' | 'no';
    fullscreen?: 'yes';
    /** (Android Only) Sets whether the WebView should enable support for the "viewport" HTML meta tag or should use a wide viewport. When the value of the setting is no, the layout width is always set to the width of the WebView control in device-independent (CSS) pixels. When the value is yes and the page contains the viewport meta tag, the value of the width specified in the tag is used. If the page does not contain the tag or does not provide a width, then a wide viewport will be used. (defaults to yes). */
    useWideViewPort?: 'yes' | 'no';
    /** Allows for latest 'beforeload' feature of Cordova InAppBrowser to be registered as an option if using plugin's latest github master (1/4/2019) instead of npm. Post is currently not supported but will be. */
    beforeload?: 'yes' | 'post' | 'get';
    /**
     * @hidden
     */
    [key: string]: any;
}
export interface InAppBrowserEvent extends Event {
    /** the eventname, either loadstart, loadstop, loaderror, or exit. */
    type: string;
    /** the URL that was loaded. */
    url: string;
    /** the error code, only in the case of loaderror. */
    code: number;
    /** the error message, only in the case of loaderror. */
    message: string;
}
/**
 * @hidden
 */
export declare class InAppBrowserObject {
    private _objectInstance;
    /**
     * Opens a URL in a new InAppBrowser instance, the current browser instance, or the system browser.
     * @param {string} url     The URL to load.
     * @param {string} [target="self"]  The target in which to load the URL, an optional parameter that defaults to _self.
     *                 _self: Opens in the WebView if the URL is in the white list, otherwise it opens in the InAppBrowser.
     *                 _blank: Opens in the InAppBrowser.
     *                 _system: Opens in the system's web browser.
     * @param {string | InAppBrowserOptions} [options] Options for the InAppBrowser. Optional, defaulting to: location=yes.
     *                 The options string must not contain any blank space, and each feature's
     *                 name/value pairs must be separated by a comma. Feature names are case insensitive.
     */
    constructor(url: string, target?: string, options?: string | InAppBrowserOptions);
    /**
     * Displays an InAppBrowser window that was opened hidden. Calling this has no effect
     * if the InAppBrowser was already visible.
     */
    show(): void;
    /**
     * Closes the InAppBrowser window.
     */
    close(): void;
    /**
     * Hides an InAppBrowser window that is currently shown. Calling this has no effect
     * if the InAppBrowser was already hidden.
     */
    hide(): void;
    /**
     * Injects JavaScript code into the InAppBrowser window.
     * @param script {Object} Details of the script to run, specifying either a file or code key.
     * @returns {Promise<any>}
     */
    executeScript(script: {
        file?: string;
        code?: string;
    }): Promise<any>;
    /**
     * Injects CSS into the InAppBrowser window.
     * @param css {Object} Details of the script to run, specifying either a file or code key.
     * @returns {Promise<any>}
     */
    insertCSS(css: {
        file?: string;
        code?: string;
    }): Promise<any>;
    /**
     * A method that allows you to listen to events happening in the browser.
     * @param event {string} Name of the event
     * @returns {Observable<InAppBrowserEvent>} Returns back an observable that will listen to the event on subscribe, and will stop listening to the event on unsubscribe.
     */
    on(event: string): Observable<InAppBrowserEvent>;
}
/**
 * @name In App Browser
 * @description Launches in app Browser
 * @usage
 * ```typescript
 * import { InAppBrowser } from '@ionic-native/in-app-browser';
 *
 * constructor(private iab: InAppBrowser) { }
 *
 *
 * ...
 *
 *
 * const browser = this.iab.create('https://ionicframework.com/');
 *
 * browser.executeScript(...);
 *
 * browser.insertCSS(...);
 * browser.on('loadstop').subscribe(event => {
 *    browser.insertCSS({ code: "body{color: red;" });
 * });
 *
 * browser.close();
 *
 * ```
 * @classes
 * InAppBrowserObject
 * @interfaces
 * InAppBrowserEvent
 * InAppBrowserOptions
 */
export declare class InAppBrowser extends IonicNativePlugin {
    /**
     * Opens a URL in a new InAppBrowser instance, the current browser instance, or the system browser.
     * @param  url {string}     The URL to load.
     * @param  target {string}  The target in which to load the URL, an optional parameter that defaults to _self.
     * @param  options {string} Options for the InAppBrowser. Optional, defaulting to: location=yes.
     *                 The options string must not contain any blank space, and each feature's
     *                 name/value pairs must be separated by a comma. Feature names are case insensitive.
     * @returns {InAppBrowserObject}
     */
    create(url: string, target?: string, options?: string | InAppBrowserOptions): InAppBrowserObject;
}
