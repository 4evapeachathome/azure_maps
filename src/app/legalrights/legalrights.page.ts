import { Component, OnInit, ViewChild } from '@angular/core';
import { UsaMapComponent } from '../usa-map/usa-map.component';

@Component({
  selector: 'app-legalrights',
  templateUrl: './legalrights.page.html',
  styleUrls: ['./legalrights.page.scss'],
  standalone: false
})
export class LegalrightsPage implements OnInit {
  selectedState: any = null;
  @ViewChild(UsaMapComponent) usaMapComponent!: UsaMapComponent;

 
  constructor() { }

  ngOnInit() {
  }

  ionViewWillLeave() {
    if (this.usaMapComponent) {
      this.usaMapComponent.resetState();
    }
  }


}
