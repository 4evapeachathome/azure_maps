import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-sripacomp',
  templateUrl: './sripacomp.component.html',
  styleUrls: ['./sripacomp.component.scss'],
  standalone: true,
    imports: [CommonModule, IonicModule],
})
export class SripacompComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
