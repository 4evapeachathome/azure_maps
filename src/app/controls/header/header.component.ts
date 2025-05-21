import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { MenuService } from 'src/shared/menu.service';

@Component({
  selector: 'pathome-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
   standalone: true,
      imports: [CommonModule, IonicModule,RouterModule],
})
export class HeaderComponent  implements OnInit {
  showExitButton: boolean = true;

  constructor(private router: Router,
    private location: Location, private menuService:MenuService) { }

  ngOnInit() {
    this.checkRoute();

    // Subscribe to route changes
    this.router.events.subscribe(() => {
      this.checkRoute();
    });
  }

  expandMenu(sectionTitle: string) {
    this.menuService.toggleAdditionalMenus(true, sectionTitle);
  }

  private checkRoute() {
    const currentPath = this.location.path().split('?')[0]; // remove query params
  
    const excludedPaths = [
      '/home',
      '',
      '/loginPage',
      '/riskassessment',
      '/riskassessmentresult',
      '/riskassessmentsummary'
    ];
  
    this.showExitButton = !excludedPaths.includes(currentPath);
  }

}
