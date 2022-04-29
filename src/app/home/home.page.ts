import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  public UUIDDLocal: string;
  constructor() {
    this.refreshUUID();
  }

  refreshUUID(){
    this.UUIDDLocal = localStorage.getItem('SESSIONDLOCALID');
  }

  async refreshAndCallCollector(){
    await this.callDlocalCollector();
    this.refreshUUID();
  }

  async callDlocalCollector(){
    const DLCollector = (<any>window).plugins.DLCollector;
    const sessionId = await DLCollector.getSessionId();
    localStorage.setItem('SESSIONDLOCALID', sessionId);
  }

}
