import { Component, OnInit, Input, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

interface MenuItem {
  id: number;
  documentId: string;
  title: string;
  link: string | null;
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

  menuItems: MenuItem[] = [];
  processedMenu: MenuItem[] = [];
  selectedId: string | null = null;

  constructor(
    private apiService: ApiService,
    private router: Router
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
  }

  loadMenuItems() {
    this.apiService.getMenuItems().subscribe(response => {
      this.menuItems = response.data;
      this.processedMenu = this.buildMenuTree(this.menuItems);
    });
  }

  buildMenuTree(items: MenuItem[]): MenuItem[] {
    // First, find the root items (items with no parent)
    const rootItems = items.filter(item => !item.parentMenu);

    // Create a map for quick lookup of items by their id
    const itemMap = new Map<number, MenuItem>();
    items.forEach(item => {
      itemMap.set(item.id, { ...item, children: [], expanded: false });
    });

    // Build the tree structure
    items.forEach(item => {
      if (item.parentMenu) {
        const parent = itemMap.get(item.parentMenu.id);
        if (parent && parent.children) {
          parent.children.push(itemMap.get(item.id)!);
        }
      }
    });

    // Return only the root items with their nested children
    return rootItems.map(item => itemMap.get(item.id)!);
  }

  toggleItem(item: MenuItem, event: Event) {
    event.stopPropagation();
    if (item.children && item.children.length > 0) {
      item.expanded = !item.expanded;
    }
    if (item.link) {
      this.router.navigate([item.link]);
    }
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
