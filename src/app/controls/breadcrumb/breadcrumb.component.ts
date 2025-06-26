// import { CommonModule } from '@angular/common';
// import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
// import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
// import { IonicModule } from '@ionic/angular';
// import { MenuService } from 'src/shared/menu.service';

// interface Breadcrumb {
//   label: string;
//   url: string;
// }

// @Component({
//   selector: 'pathome-breadcrumb',
//   templateUrl: './breadcrumb.component.html',
//   styleUrls: ['./breadcrumb.component.scss'],
//    standalone: true,
//     imports: [CommonModule, IonicModule],
//     schemas: [CUSTOM_ELEMENTS_SCHEMA]
// })
// export class BreadcrumbComponent  implements OnInit,OnChanges {
//   breadcrumbPath: { title: string; link?: string }[] = [];
//   @Input() selectedState: { id: string; name: string } | null = null;
//   @Output() stateCleared = new EventEmitter<void>();

//   constructor(
//     private menuService: MenuService,
//     private route: ActivatedRoute,
//     private router: Router
//   ) {}

//   ngOnInit() {
//     this.route.url.subscribe(() => {
//       const menuItems = this.menuService.getMenuItems();
//       if (menuItems.length > 0) {
//         this.generateBreadcrumb(menuItems);
//       }
//     });
//   }

//   ngOnChanges(changes: SimpleChanges) {
//     if (changes['selectedState']) {
//       if (this.selectedState) {
//         // If a state is selected, update the breadcrumb with the state
//         this.clearLastState();
//         this.updateBreadcrumbWithState();
//       } else {
//         // If selectedState becomes null, remove the state breadcrumb
//         this.clearLastState();
//       }
//     }
//   }

//   clearLastState() {
//     // Remove any breadcrumb that matches a state URL pattern
//     this.breadcrumbPath = this.breadcrumbPath.filter(item => 
//       !item.link?.includes('/uslawsbystate/')
//     );
//   }

//   generateBreadcrumb(menuItems: any[]) {
//     const currentUrl = this.router.url;
//     const currentPage = menuItems.find(item => item.link === currentUrl);

//     if (currentPage) {
//       this.breadcrumbPath = this.getBreadcrumbHierarchy(currentPage, menuItems).reverse();
//     }

//     if (this.selectedState) {
//       this.updateBreadcrumbWithState();
//     }
//   }

//   updateBreadcrumbWithState() {
//     if (this.selectedState) {
//       const lastItem = this.breadcrumbPath[this.breadcrumbPath.length - 1];
  
//       // If the last breadcrumb is a state, replace it
//       if (lastItem && lastItem.link?.includes('/uslawsbystate/')) {
//         this.breadcrumbPath[this.breadcrumbPath.length - 1] = {
//           title: this.selectedState.name,
//           link: `/uslawsbystate/${this.selectedState.id}`
//         };
//       } else {
//         // Otherwise, add the state as a new breadcrumb
//         this.breadcrumbPath.push({
//           title: this.selectedState.name,
//           link: `/uslawsbystate/${this.selectedState.id}`
//         });
//       }
//     }
//   }

//   getBreadcrumbHierarchy(item: any, menuItems: any[], path: any[] = []): any[] {
//     if (!item) return path;
//     path.push(item);
//     if (item.parentMenu) {
//       const parent = menuItems.find(menu => menu.id === item.parentMenu.id);
//       return this.getBreadcrumbHierarchy(parent, menuItems, path);
//     }
//     return path;
//   }

//   navigateTo(link: string) {
//     if (link === '/uslawsbystate') {
//       this.selectedState = null;
//       this.breadcrumbPath = this.breadcrumbPath.filter(item => !item.link?.includes('/uslawsbystate/')); 
//       this.stateCleared.emit();
//     }
//     this.router.navigateByUrl(link);
//   }

// }
import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { IonicModule, Platform } from '@ionic/angular';
import { MenuService } from 'src/shared/menu.service';
import { FormsModule } from '@angular/forms';

interface Breadcrumb {
  label: string;
  url: string;
}

@Component({
  selector: 'pathome-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BreadcrumbComponent implements OnInit, OnChanges {
  breadcrumbPath: { title: string; link?: string }[] = [];
  @Input() selectedState: { id: string; name: string } | null = null;
  @Input() states: { id: string; name: string }[] = [];
  @Output() stateCleared = new EventEmitter<void>();
  @Output() stateSelected = new EventEmitter<{ id: string; name: string }>();
  tempSelectedState: { id: string; name: string } | null = null;
  isUsLawsByStatePage: boolean = false;

  constructor(
    private menuService: MenuService,
    private route: ActivatedRoute,
    private router: Router,
    private platform: Platform
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isUsLawsByStatePage = event.urlAfterRedirects.includes('/uslawsbystate');
        if (!this.isUsLawsByStatePage) {
          this.selectedState = null;
          this.tempSelectedState = null;
        }
      }
    });
  }

  ngOnInit() {
    this.route.url.subscribe(() => {
      const menuItems = this.menuService.getMenuItems();
      if (menuItems.length > 0) {
        this.generateBreadcrumb(menuItems);
      }
      this.isUsLawsByStatePage = this.router.url.includes('/uslawsbystate');
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedState']) {
      this.selectedState = changes['selectedState'].currentValue;
      this.tempSelectedState = this.selectedState ? { ...this.selectedState } : null;
      if (this.selectedState) {
        this.clearLastState();
        this.updateBreadcrumbWithState();
      } else {
        this.clearLastState();
        if (this.isUsLawsByStatePage) {
          const menuItems = this.menuService.getMenuItems();
          this.generateBreadcrumb(menuItems); // Rebuild breadcrumb path without duplicates
        }
      }
    }
    if (changes['states']) {
      this.states = changes['states'].currentValue || [];
    }
  }

  compareStates(state1: { id: string; name: string }, state2: { id: string; name: string }) {
    return state1 && state2 ? state1.id === state2.id : state1 === state2;
  }

  clearLastState() {
    this.breadcrumbPath = this.breadcrumbPath.filter(item => 
      !item.link?.includes('/uslawsbystate/')
    );
  }

  generateBreadcrumb(menuItems: any[]) {
    const currentUrl = this.router.url.split('?')[0];
    const currentPage = menuItems.find(item => item.link === currentUrl);

    if (currentPage) {
      this.breadcrumbPath = this.getBreadcrumbHierarchy(currentPage, menuItems).reverse();
    }

    if (this.isUsLawsByStatePage && !this.selectedState) {
      // Prevent duplicates by checking if "US Laws By State" already exists
      const hasUsLawsByState = this.breadcrumbPath.some(item => item.link === '/uslawsbystate');
      if (!hasUsLawsByState) {
        this.breadcrumbPath.push({
          title: 'US Laws By State',
          link: '/uslawsbystate'
        });
      }
    } else if (this.selectedState && this.isUsLawsByStatePage) {
      this.updateBreadcrumbWithState();
    }
  }

  updateBreadcrumbWithState() {
    if (this.selectedState && this.isUsLawsByStatePage) {
      const lastItem = this.breadcrumbPath[this.breadcrumbPath.length - 1];
  
      if (lastItem && lastItem.link?.includes('/uslawsbystate/')) {
        this.breadcrumbPath[this.breadcrumbPath.length - 1] = {
          title: this.selectedState.name,
          link: `/uslawsbystate/${this.selectedState.id}`
        };
      } else {
        this.breadcrumbPath.push({
          title: this.selectedState.name,
          link: `/uslawsbystate/${this.selectedState.id}`
        });
      }
    }
  }

  getBreadcrumbHierarchy(item: any, menuItems: any[], path: any[] = []): any[] {
    if (!item) return path;
    path.push({
      title: item.title,
      link: item.link
    });
    if (item.parentMenu) {
      const parent = menuItems.find(menu => menu.id === item.parentMenu.id);
      return this.getBreadcrumbHierarchy(parent, menuItems, path);
    }
    return path;
  }

  navigateTo(link: string) {
    if (link === '/uslawsbystate') {
      this.selectedState = null;
      this.tempSelectedState = null;
      this.clearLastState();
      const menuItems = this.menuService.getMenuItems();
      this.generateBreadcrumb(menuItems); // Rebuild breadcrumb path without duplicates
      this.stateCleared.emit();
    }
    this.router.navigateByUrl(link);
  }

  onStateSelect(state: { id: string; name: string }) {
    if (state) {
      this.selectedState = { ...state };
      this.tempSelectedState = { ...state };
      this.stateSelected.emit(state);
      this.updateBreadcrumbWithState();
    }
  }
}