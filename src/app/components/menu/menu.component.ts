import { Component, OnInit, Input, CUSTOM_ELEMENTS_SCHEMA, NgZone } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { MenuService } from 'src/shared/menu.service';
import { Subscription } from 'rxjs';

interface MenuItem {
  id: number;
  documentId: string;
  title: string;
  link: string | null;
  order:number;
  parentMenu: MenuItem | null;
  children?: MenuItem[];
  expanded?: boolean;
}

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MenuComponent implements OnInit {
  @Input() fields: string[] = ['title', 'link'];
  @Input() populate: string[] = ['parentMenu'];
  @Input() sort: string[] = ['createdAt:asc'];
  @Input() isSidebarExpanded: boolean = true;

  menuItems: MenuItem[] = [];
  processedMenu: MenuItem[] = [];
  selectedId: string | null = null;
  showAdditionalMenus: boolean = false;
  @Input() isMenuOpen: boolean = true;
  public subscription!: Subscription;
  currentExpandedSection: string | null = null;
  showUserName:boolean = false;

  // Define the titles of menus to hide initially
  private initiallyHiddenMenuTitles = [
    'No Peace at Home',
    'Support Service',
    'Your Rights'
  ];

  constructor(
    private apiService: ApiService,
    private router: Router,
    private menuService: MenuService,
    private zone: NgZone
  ) {
    
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.selectedId = this.router.url;
      this.expandCurrentSection();
    });
    this.zone.run(() => {
      setTimeout(() => this.expandCurrentSection(), 0);
    });
  }


  ngOnInit(): void {
  this.loadMenuItems();

  this.subscription = this.menuService.showAdditionalMenus$.subscribe(({ show, sectionTitle }) => {
    this.showAdditionalMenus = show;

    if (show) {
      // First process the menu tree
      this.processedMenu = this.buildMenuTree(this.menuItems);

      // Collapse all sections initially
      this.collapseAllSections();

      // Then expand only the target section (if provided)
      if (sectionTitle) {
        this.expandOnlySection(sectionTitle);
      }
    } else {
      // If not showing, make sure all sections are collapsed
      this.collapseAllSections();
    }
  });
}



collapseAllSections(): void {
  this.processedMenu.forEach(item => item.expanded = false);
}
  expandOnlySection(title: string) {
    this.currentExpandedSection = title;
  
    this.processedMenu.forEach(item => {
      if (!item.parentMenu && item.children?.length) {
        item.expanded = item.title === title;
      }
    });
  }

  shouldHideIcon(item: any): boolean {
    // If sidebar is expanded, hide icons for child items (i.e., those with parentMenu)
    return this.isMenuOpen && item.parentMenu !== null;
  }

  loadMenuItems() {
    this.apiService.getMenuItems().subscribe(
      (response: any) => {
        if (Array.isArray(response)) {
          this.menuItems = response;
          this.processedMenu = this.buildMenuTree(this.menuItems);
          this.menuService.setMenuItems(this.menuItems);
          this.selectedId = this.router.url;
         this.expandCurrentSection();
        } else {
          console.error('Invalid response format:', response);
        }
      },
      (error: any) => {
        console.error('Error fetching menu items:', error);
      }
    );
  }

  buildMenuTree(items: MenuItem[]): MenuItem[] {
    if (!items) {
      console.error('Invalid items:', items);
      return [];
    }

    const rootItems = items.filter(item => !item.parentMenu);
    const itemMap = new Map<number, MenuItem>();
    
    items.forEach(item => {
      itemMap.set(item.id, { 
        ...item, 
        children: [], 
        expanded: false
      });
    });

    items.forEach(item => {
      if (item.parentMenu) {
        const parent = itemMap.get(item.parentMenu.id);
        if (parent && parent.children) {
          parent.children.push(itemMap.get(item.id)!);
        }
      }
    });

    // Sort children of each item: order first (asc), then id (asc) if order is null
    itemMap.forEach(item => {
      if (item.children && item.children.length > 0) {
        item.children.sort((a, b) => {
          if (a.order !== null && b.order !== null) {
            return a.order - b.order; // Sort by order if both have it
          }
          if (a.order === null && b.order === null) {
            return a.id - b.id; // Sort by id if both orders are null
          }
          return a.order === null ? 1 : -1; // Null orders come last
        });
      }
    });

    const allRootItems = rootItems.map(item => itemMap.get(item.id)!);
    
    // Sort root items: order first (asc), then id (asc) if order is null
    const sortedRootItems = allRootItems.sort((a, b) => {
      if (a.order !== null && b.order !== null) {
        return a.order - b.order; // Sort by order if both have it
      }
      if (a.order === null && b.order === null) {
        return a.id - b.id; // Sort by id if both orders are null
      }
      return a.order === null ? 1 : -1; // Null orders come last
    });

    const filteredItems = sortedRootItems.filter(item => {
      if (
        this.initiallyHiddenMenuTitles.includes(item.title) &&
        !this.menuService.hasAppLoadedOnce
      ) {
        return false; // Hide on first load only
      }
      return true;
    });
  
    // After building for the first time, mark as loaded
    this.menuService.hasAppLoadedOnce = true;
  
    return filteredItems;
  }

  toggleItem(item: MenuItem, event: Event) {
    event.stopPropagation();
  
    // Show additional menus when clicking "Peace at Home"
    if (item.title === 'Peace at Home' && !this.showAdditionalMenus) {
      this.showAdditionalMenus = true;
      this.processedMenu = this.buildMenuTree(this.menuItems);
    } 
    // Always reset additional menus when clicking Home
    else if (item.title === 'Home') {
      this.showAdditionalMenus = false;
      this.processedMenu = this.buildMenuTree(this.menuItems);
      this.collapseAllItems(this.processedMenu);
    } 
    else {
      // For any other main menu click, collapse all other root menus
      if (!item.parentMenu) {
        this.showAdditionalMenus = false; // reset additional menus on other main menus
        this.processedMenu.forEach(rootItem => {
          if (rootItem !== item) {
            rootItem.expanded = false;
            if (rootItem.children) {
              this.collapseAllItems(rootItem.children);
            }
          }
        });
      }
    }
  
    this.menuService.lastExpandedSection = item.title;
  
    // Expand clicked root-level menu if it has children
    // if (!item.parentMenu && item.children && item.children.length > 0) {
    //   if (!item.expanded) {
    //     item.expanded = true;
    //   }
    // } 
    if (!item.parentMenu && item.children && item.children.length > 0) {
      item.expanded = !item.expanded; // Toggle the expanded state
    }
    // Expand non-root items with children if not already expanded
    // else if (item.children && item.children.length > 0) {
    //   if (!item.expanded) {
    //     item.expanded = true;
    //   }
    // }
    else if (item.children && item.children.length > 0) {
      item.expanded = !item.expanded;
    }
  
    if (item.link) {
      this.router.navigate([item.link]);
    }
  }

  private collapseAllItems(items: MenuItem[]) {
    items.forEach(item => {
      item.expanded = false;
      if (item.children) {
        this.collapseAllItems(item.children);
      }
    });
  }

  getTooltip(item: any): string {    
    // Then check if the item has a specific tooltip
    if (item.tooltip && item.tooltip.trim() !== '') {
      return item.tooltip;
    }
    
    // Fall back to the item title
    return item.title || '';
  }

  
  hasTooltip(title: string): boolean {
    return title === '/quiz' || title === '/ssripaa';
  }


  
  expandCurrentSection() {
    const expandParents = (items: MenuItem[]) => {
      items.forEach(item => {
        if (item.link === this.selectedId) {
          // Found the current item, expand all its parents
          let currentItem: MenuItem | null = item;
          while (currentItem) {
            currentItem.expanded = true;
            currentItem = this.findParentItem(currentItem, this.processedMenu);
          }
        }
        if (item.children) {
          expandParents(item.children);
        }
      });
    };
    expandParents(this.processedMenu);
  }

  findParentItem(child: MenuItem, items: MenuItem[]): MenuItem | null {
    for (const item of items) {
      if (item.children?.includes(child)) {
        return item;
      }
      if (item.children) {
        const parent = this.findParentItem(child, item.children);
        if (parent) {
          return parent;
        }
      }
    }
    return null;
  }

  getIconName(item: MenuItem): string {
    if (item.children && item.children.length > 0) {
      return 'caret-forward-outline';
    }
    return 'chevron-forward-outline';
  }
}
