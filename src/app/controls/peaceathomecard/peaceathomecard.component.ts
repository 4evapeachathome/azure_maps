import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'pathome-peaceathomecard',
  templateUrl: './peaceathomecard.component.html',
  styleUrls: ['./peaceathomecard.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class PeaceathomecardComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
