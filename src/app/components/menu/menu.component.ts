import { Component, OnInit, Input, CUSTOM_ELEMENTS_SCHEMA, NgZone, Output, EventEmitter, AfterViewInit } from '@angular/core';
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
export class MenuComponent implements OnInit,AfterViewInit {
  @Input() fields: string[] = ['title', 'link'];
  @Input() populate: string[] = ['parentMenu'];
  @Input() sort: string[] = ['createdAt:asc'];
  @Input() isSidebarExpanded: boolean = true;
  @Output() menuItemClicked: EventEmitter<boolean> = new EventEmitter<boolean>();

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
    '/nopeaceathome',
    '/yourrights',
    '/supportservice'
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

  ngAfterViewInit(): void {
    // Delay emission to wait for DOM to settle
    setTimeout(() => {
      this.menuService.setMenuLoaded(true); // ✅ Notify only after DOM renders
    }, 30);
  }


collapseAllSections(): void {
  this.processedMenu.forEach(item => item.expanded = false);
}
  expandOnlySection(title: string) {
    this.currentExpandedSection = title;
  
    this.processedMenu.forEach(item => {
      if (!item.parentMenu && item.children?.length) {
        item.expanded = item.link === title;
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

    const currentRoute = this.router.url.split('?')[0];
    const filteredItems = sortedRootItems.filter((item:any) => {
      const isCurrentRoute = item.link === currentRoute;
      if (
        this.initiallyHiddenMenuTitles.includes(item.link) &&
        !this.menuService.hasAppLoadedOnce && !isCurrentRoute
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
  
    if (item.link === '/peaceathome' && !this.showAdditionalMenus) {
      this.showAdditionalMenus = true;
      this.processedMenu = this.buildMenuTree(this.menuItems);
    } else if (item.link === '/home') {
      this.showAdditionalMenus = false;
      this.processedMenu = this.buildMenuTree(this.menuItems);
      this.collapseAllItems(this.processedMenu);
    } else {
      if (!item.parentMenu) {
        this.showAdditionalMenus = false;
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
  
    if (!item.parentMenu && item.children && item.children.length > 0) {
      item.expanded = !item.expanded;
    } else if (item.children && item.children.length > 0) {
      item.expanded = !item.expanded;
    }
  
    // 🔥 Emit for leaf node
    if (this.isLeafNode(item)) {
      this.menuItemClicked.emit(true);
    }
  
    if (item.link) {
      this.router.navigate([item.link]);
    }
  }
  
  isLeafNode(item: MenuItem): boolean {
    return !item.children || item.children.length === 0;
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
    return title === '/quiz' || title === '/ssripa';
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
