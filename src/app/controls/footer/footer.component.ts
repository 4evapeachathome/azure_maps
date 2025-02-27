import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'pathome-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  standalone: true,
    imports: [CommonModule, IonicModule, RouterModule]
})
export class FooterComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
