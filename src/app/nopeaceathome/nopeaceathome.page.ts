import { Component, OnInit } from '@angular/core';
import { APIEndpoints } from 'src/shared/endpoints';
import { MenuService } from 'src/shared/menu.service';

@Component({
  selector: 'app-nopeaceathome',
  templateUrl: './nopeaceathome.page.html',
  styleUrls: ['./nopeaceathome.page.scss'],
  standalone: false
})
export class NopeaceathomePage implements OnInit {
  nopeaceathomeslider:string=APIEndpoints.nopeaceathomeslider;
  nopeaceathometitlecontent:string= APIEndpoints.nopeaceathometitlecontent;
  nopeacepartnerviolencecontent:string=APIEndpoints.nopeacepartnerviolencecontent;
  nopeacehouseholdconflicts:string=APIEndpoints.nopeacehouseholdconflicts;
  nopeacetoxicrelationship:string=APIEndpoints.nopeacetoxicrelationship;
  constructor(private menuService:MenuService) { }

  ngOnInit() {
  }

  expandMenu(sectionTitle: string) {
    this.menuService.toggleAdditionalMenus(true, sectionTitle);
  }

}
