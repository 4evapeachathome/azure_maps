import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { IonicModule, Platform } from '@ionic/angular';
import { MenuService } from 'src/shared/menu.service';

@Component({
  selector: 'pathome-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  standalone: true,
    imports: [CommonModule, IonicModule, RouterModule]
})
export class FooterComponent  implements OnInit {
  isMobile: boolean = false;

  constructor(private menuService:MenuService,private platform: Platform) { }

  ngOnInit() {
    this.isMobile = this.platform.is('android') || this.platform.is('ios');  }

  expandMenu() {
    this.menuService.toggleAdditionalMenus(true);
  }
}
