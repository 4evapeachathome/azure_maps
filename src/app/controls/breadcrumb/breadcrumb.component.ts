import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { filter } from 'rxjs';
import { MenuService } from 'src/shared/menu.service';

interface Breadcrumb {
  label: string;
  url: string;
}

@Component({
  selector: 'pathome-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss'],
   standalone: true,
    imports: [CommonModule, IonicModule],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BreadcrumbComponent  implements OnInit,OnChanges {
  @Input() selectedState: string | null = null;  // Receive selected state name
  @Output() breadcrumbClicked = new EventEmitter<void>();
  breadcrumbPath: { title: string; link?: string }[] = [];

  constructor(
    private menuService: MenuService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.url.subscribe(() => {
      const menuItems = this.menuService.getMenuItems();
      if (menuItems.length > 0) {
        this.generateBreadcrumb(menuItems);
      }
    });
  }

  generateBreadcrumb(menuItems: any[]) {
    const currentUrl = this.router.url;
    const currentPage = menuItems.find(item => item.link === currentUrl);

    if (currentPage) {
      this.breadcrumbPath = this.getBreadcrumbHierarchy(currentPage, menuItems).reverse();

      // If a state is selected, append it to the breadcrumb path
     // debugger;
      if (this.selectedState) {
        this.breadcrumbPath.push({
          title: this.selectedState,
          link: this.router.url,  // Keep the same URL
        });
      }
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedState']) {
      this.updateBreadcrumb();
    }
  }

  updateBreadcrumb() {
    this.breadcrumbPath = [
      { title: 'Legal Rights', link: '/federallaw' },
      { title: 'US Laws by State', link: '/uslawsbystate' },
    ];

    if (this.selectedState) {
      this.breadcrumbPath.push({ title: this.selectedState });
    }
  }

  getBreadcrumbHierarchy(item: any, menuItems: any[], path: any[] = []): any[] {
    if (!item) return path;
    path.push(item);
    if (item.parentMenu) {
      const parent = menuItems.find(menu => menu.id === item.parentMenu.id);
      return this.getBreadcrumbHierarchy(parent, menuItems, path);
    }
    return path;
  }

  navigateTo(link: string) {
   // debugger;
    console.log('Navigating to:', link);
    if (link === '/uslawsbystate') {
        console.log('Emitting event');
        this.breadcrumbClicked.emit(); 
    }
    this.router.navigateByUrl(link);
}

}
