import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { MenuService } from 'src/shared/menu.service';

@Component({
  selector: 'pathome-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  standalone: true,
    imports: [CommonModule, IonicModule, RouterModule]
})
export class FooterComponent  implements OnInit {

  constructor(private menuService:MenuService) { }

  ngOnInit() {}

  expandMenu() {
    this.menuService.toggleAdditionalMenus(true);
  }
}
