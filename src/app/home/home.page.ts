import {Component} from '@angular/core';
import { Router } from '@angular/router';
import { APIEndpoints } from 'src/shared/endpoints';
import { MenuService } from 'src/shared/menu.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
  // imports: [IonicModule, MenuComponent]
})
export class HomePage {
  sliderEndpoint:string = APIEndpoints.sliderapi;

  constructor(private router: Router, private menuService:MenuService) {}

  navigateToPeaceAtHome() {
    this.router.navigate(['/peaceathome']);
  }

  expandMenu(sectionTitle: string) {
    this.menuService.toggleAdditionalMenus(true, sectionTitle);
  }
}
