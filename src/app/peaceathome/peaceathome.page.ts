import { Component, OnInit } from '@angular/core';
import { APIEndpoints } from 'src/shared/endpoints';
import { MenuService } from 'src/shared/menu.service';

@Component({
  selector: 'app-peaceathome',
  templateUrl: './peaceathome.page.html',
  styleUrls: ['./peaceathome.page.scss'],
  standalone: false,
})
export class PeaceathomePage implements OnInit {
  peaceathomeslider:string = APIEndpoints.peaceathomeslider;
  constructor(private menuService:MenuService) { }

  expandMenu(sectionTitle: string) {
    this.menuService.toggleAdditionalMenus(true, sectionTitle);
  }
  ngOnInit() {
  }

}
