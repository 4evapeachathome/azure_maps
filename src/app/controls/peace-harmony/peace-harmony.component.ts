import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'pathome-peace-harmony',
  templateUrl: './peace-harmony.component.html',
  styleUrls: ['./peace-harmony.component.scss'],
  standalone: true,
    imports: [CommonModule, IonicModule]
})
export class PeaceHarmonyComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
