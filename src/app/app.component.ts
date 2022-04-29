import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Diagnostic } from '@awesome-cordova-plugins/diagnostic/ngx';
import { Geolocation } from '@awesome-cordova-plugins/geolocation/ngx';
declare var cordova;
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  optionsMaps = {
    enableHighAccuracy: true,
    maximumAge: 3600,
    timeout: 20000
  };

  constructor(
    private platform: Platform,
    private geolocation: Geolocation,
    private diagnostic: Diagnostic
  ) {
    this.initializeApp();
  }
  
  /**
   * Metodo que se ecarga de hacer las acciones inciales
   */
   initializeApp() {

    this.platform.ready().then(async () => {

      if (this.platform.is('cordova')) {
        if (this.platform.is('ios')) {
          // Request tracking permission
          this.requestTrackingPermission();
        } else {
          await this.callDlocalCollector();
        }

        await this.requestPermission();
        
    }});
  }

  async requestPermission() {
    await this.platform.ready();
    if (this.platform.is('android')) {
      this.diagnostic.isGpsLocationEnabled().then((isAvailable) => {
        if (isAvailable) {
          this.nextStepToCurrentLocation();
        } else {
        }
      }).catch((error) => {
      });
    } else {
      this.nextStepToCurrentLocation();
    }
  }

  /**
   * Obtiene la ubicación del usuario una vez obtenido el permiso del usuario
   */
   async nextStepToCurrentLocation() {

    this.platform.ready().then(async () => {
      await this.geolocation.getCurrentPosition(this.optionsMaps).then((resp) => {
        localStorage.setItem('HAS_PERMISSION', 'true');
      }).catch((error) => {
        localStorage.setItem('HAS_PERMISSION', 'false');
      });
    });
  }

  requestTrackingPermission() {
    const idfaPlugin = cordova.plugins.idfa;
    const contextCurrent = this;

    idfaPlugin.getInfo()
      .then(async info => {
        if (!info.trackingLimited) {
          return info.idfa || info.aaid;
        } else if (info.trackingPermission === idfaPlugin.TRACKING_PERMISSION_NOT_DETERMINED) {
          return idfaPlugin.requestPermission().then(result => {
            if (result === idfaPlugin.TRACKING_PERMISSION_AUTHORIZED) {
              return idfaPlugin.getInfo().then(async info => {
                await this.callDlocalCollector();
                return info.idfa || info.aaid;
              });
            }
          });
        } else {
          if (info.trackingPermission === idfaPlugin.TRACKING_PERMISSION_AUTHORIZED) {
            await this.callDlocalCollector();
          }
        }
      })
      .then(idfaOrAaid => {
        if (idfaOrAaid) {
          console.log(idfaOrAaid);
        }
      });
  }

  async callDlocalCollector(){
    const DLCollector = (<any>window).plugins.DLCollector;

    DLCollector.setUp({
      apiKey: "9c0cfa84-bfa6-4de1-b8ed-9ee26104031c",
      env: DLCollector.ENV_SANDBOX // or DLCollector.ENV_PROD
    });

    DLCollector.startSession();
    const sessionId = await DLCollector.getSessionId();
    localStorage.setItem('SESSIONDLOCALID', sessionId);
  }
}
