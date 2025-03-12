import { Component, OnInit, ViewChild } from '@angular/core';
import { SupportserviceComponent } from '../controls/supportservice/supportservice.component';

@Component({
  selector: 'app-supportservice',
  templateUrl: './supportservice.page.html',
  styleUrls: ['./supportservice.page.scss'],
  standalone: false,
})
export class SupportservicePage implements OnInit {
  @ViewChild(SupportserviceComponent) supportServiceComponent!: SupportserviceComponent;

  constructor() { }

  ngOnInit() {
  }


  ionViewWillEnter() {
    if (this.supportServiceComponent) {
      this.supportServiceComponent.getSupportServiceFilterOptions();
      this.supportServiceComponent.getSupportServiceData(this.supportServiceComponent.endPoint);
    }    
}


ionViewDidLeave() {
  if (this.supportServiceComponent) {
    this.supportServiceComponent.resetState();
  }
}
}