import { Component, OnInit } from '@angular/core';
import { APIEndpoints } from 'src/shared/endpoints';
import { MenuService } from 'src/shared/menu.service';

@Component({
  selector: 'app-healthyrelationship',
  templateUrl: './healthyrelationship.page.html',
  styleUrls: ['./healthyrelationship.page.scss'],
  standalone: false,
})
export class HealthyrelationshipPage implements OnInit {
healthyrelationslider:string = APIEndpoints.healthyrelationslider;
healtyrelationTitleContent:string = APIEndpoints.healtyrelationTitleContent;
healthyrelationcontentwithoutbutton = APIEndpoints.healthyrelationcontentwithoutbutton;
healthyrelationcontentwithbutton = APIEndpoints.healthyrelationcontentwithbutton;
  constructor(private menuService:MenuService) { }

  ngOnInit() {
  }

  expandMenu(sectionTitle: string) {
    this.menuService.toggleAdditionalMenus(true, sectionTitle);
  }

}
