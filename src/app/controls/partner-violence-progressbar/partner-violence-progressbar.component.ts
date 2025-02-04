import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'pathome-partner-violence-progressbar',
  templateUrl: './partner-violence-progressbar.component.html',
  styleUrls: ['./partner-violence-progressbar.component.scss'],
    standalone: true,
    imports: [CommonModule, IonicModule],
})
export class PartnerViolenceProgressbarComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
