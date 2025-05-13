import { Component, OnInit, Input, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
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

  // Define the titles of menus to hide initially
  private initiallyHiddenMenuTitles = [
    'No Peace at Home',
    'Support Service',
    'Legal Rights'
  ];

  constructor(
    private apiService: ApiService,
    private router: Router,
    private menuService: MenuService
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.selectedId = this.router.url;
      this.expandCurrentSection();
    });
  }

  ngOnInit() {
    this.loadMenuItems();
    this.subscription = this.menuService.showAdditionalMenus$.subscribe(show => {
      this.showAdditionalMenus = show;
      if (show && this.menuItems.some(item => item.title === 'Peace at Home')) {
        this.processedMenu = this.buildMenuTree(this.menuItems);
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

    return sortedRootItems.filter(item => {
      if (this.initiallyHiddenMenuTitles.includes(item.title)) {
        return this.showAdditionalMenus;
      }
      return true;
    });
  }

  toggleItem(item: MenuItem, event: Event) {
    event.stopPropagation();

    // Show additional menus when clicking "Peace at Home"
    if (item.title === 'Peace at Home' && !this.showAdditionalMenus) {
      this.showAdditionalMenus = true;
      this.processedMenu = this.buildMenuTree(this.menuItems);
    }
    // Collapse additional menus when clicking "Home"
    else if (item.title === 'Home' && this.showAdditionalMenus) {
      this.showAdditionalMenus = false;
      this.processedMenu = this.buildMenuTree(this.menuItems);
      this.collapseAllItems(this.processedMenu);
    }

    // If the item is a root-level item (no parent), collapse all other root items
    if (!item.parentMenu && item.children && item.children.length > 0) {
      this.processedMenu.forEach(rootItem => {
        if (rootItem !== item) {
          rootItem.expanded = false; // Collapse other root items
        }
      });
      item.expanded = !item.expanded; // Toggle the clicked item
    } else if (item.children && item.children.length > 0) {
      item.expanded = !item.expanded; // Toggle non-root items as before
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

  getTooltip(name: string): string | null {
    if (name === 'Quiz') {
      return 'Quiz for Healthy and Unhealthy Relationship';
    } else if (name === 'SSRIPA') {
      return 'Signs of Self-Recognition in Intimate Partner Abuse';
    }
    return null;
  }

  hasTooltip(title: string): boolean {
    return title === 'Quiz' || title === 'SSRIPA';
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
