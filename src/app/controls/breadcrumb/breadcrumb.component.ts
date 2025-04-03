import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
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
  breadcrumbPath: { title: string; link?: string }[] = [];
  @Input() selectedState: { id: string; name: string } | null = null;
  @Output() stateCleared = new EventEmitter<void>();

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

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedState']) {
      if (this.selectedState) {
        // If a state is selected, update the breadcrumb with the state
        this.clearLastState();
        this.updateBreadcrumbWithState();
      } else {
        // If selectedState becomes null, remove the state breadcrumb
        this.clearLastState();
      }
    }
  }

  clearLastState() {
    // Remove any breadcrumb that matches a state URL pattern
    this.breadcrumbPath = this.breadcrumbPath.filter(item => 
      !item.link?.includes('/uslawsbystate/')
    );
  }

  generateBreadcrumb(menuItems: any[]) {
    const currentUrl = this.router.url;
    const currentPage = menuItems.find(item => item.link === currentUrl);

    if (currentPage) {
      this.breadcrumbPath = this.getBreadcrumbHierarchy(currentPage, menuItems).reverse();
    }

    if (this.selectedState) {
      this.updateBreadcrumbWithState();
    }
  }

  updateBreadcrumbWithState() {
    if (this.selectedState) {
      const lastItem = this.breadcrumbPath[this.breadcrumbPath.length - 1];
  
      // If the last breadcrumb is a state, replace it
      if (lastItem && lastItem.link?.includes('/uslawsbystate/')) {
        this.breadcrumbPath[this.breadcrumbPath.length - 1] = {
          title: this.selectedState.name,
          link: `/uslawsbystate/${this.selectedState.id}`
        };
      } else {
        // Otherwise, add the state as a new breadcrumb
        this.breadcrumbPath.push({
          title: this.selectedState.name,
          link: `/uslawsbystate/${this.selectedState.id}`
        });
      }
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
    if (link === '/uslawsbystate') {
      this.selectedState = null;
      this.breadcrumbPath = this.breadcrumbPath.filter(item => !item.link?.includes('/uslawsbystate/')); 
      this.stateCleared.emit();
    }
    this.router.navigateByUrl(link);
  }

}
