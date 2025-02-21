import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
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
export class BreadcrumbComponent  implements OnInit {
  breadcrumbPath: any[] = [];

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
    this.router.navigateByUrl(link);
  }

}
