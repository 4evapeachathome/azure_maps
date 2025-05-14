import { Component, OnInit } from '@angular/core';
import { APIEndpoints } from 'src/shared/endpoints';
import { MenuService } from 'src/shared/menu.service';

@Component({
  selector: 'app-unhealthyrelationship',
  templateUrl: './unhealthyrelationship.page.html',
  styleUrls: ['./unhealthyrelationship.page.scss'],
  standalone: false
})
export class UnhealthyrelationshipPage implements OnInit {
public readonly unhealthyrelationcontent :string = APIEndpoints.unhealthyrelationshipbanner;
public readonly unhealthyrelationslider :string = APIEndpoints.unhealthyrelationshipslider
public readonly unhealthyrelationcontentone :string = APIEndpoints.unhealthyrelationcontentone
public readonly unhealthyrelationcontenttwo :string = APIEndpoints.unhealthyrelationcontenttwo
public readonly unhealthyrelationcontentthree :string = APIEndpoints.unhealthyrelationcontentthree

  constructor(private menuService:MenuService) { }

  ngOnInit() {
  }

  expandMenu(sectionTitle: string) {
    this.menuService.toggleAdditionalMenus(true, sectionTitle);
  }

}
