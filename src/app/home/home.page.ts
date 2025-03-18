import { AfterViewInit, Component, ElementRef, EventEmitter, NgZone, Output, ViewChild } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { MenuComponent } from '../components/menu/menu.component';
import { APIEndpoints } from 'src/shared/endpoints';
import { HeightService } from 'src/shared/height.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
  // imports: [IonicModule, MenuComponent]
})
export class HomePage implements AfterViewInit {
  @ViewChild('gridElement', { static: false }) gridElement!: ElementRef;
  @ViewChild('contentElement', { static: false }) contentElement!: ElementRef;
  sliderEndpoint:string = APIEndpoints.sliderapi;

  constructor(private heightService: HeightService,
    private el: ElementRef,
    private ngZone: NgZone) {}

    ngAfterViewInit() {
      this.initializeScrollSync();
    }
  
    private initializeScrollSync() {
      const grid = this.gridElement?.nativeElement;
      const content = this.contentElement?.nativeElement;
  
      if (grid && content) {
        const gridHeight = grid.offsetHeight;
        console.log('Grid Height:', gridHeight);
        this.heightService.setGridHeight(gridHeight);
  
        grid.addEventListener('scroll', () => this.syncScroll(grid, content));
        content.addEventListener('scroll', () => this.syncScroll(grid, content));
      } else {
        console.error('Grid or Content element not found');
      }
    }
  
    private syncScroll(grid: HTMLElement, content: HTMLElement) {
      const gridScrollHeight = grid.scrollHeight;
      const gridScrollTop = grid.scrollTop;
      const gridClientHeight = grid.clientHeight;
      const isAtBottom = gridScrollTop + gridClientHeight >= gridScrollHeight - 5; 
  
      if (isAtBottom) {
        // Inner scroll reached bottom, move outer scroll
        const totalScroll = gridScrollHeight - gridClientHeight;
        const scrollPercentage = gridScrollTop / totalScroll;
        const contentScrollHeight = content.scrollHeight;
        const contentClientHeight = content.clientHeight;
        const newScrollTop = scrollPercentage * (contentScrollHeight - contentClientHeight);
        content.scrollTo({ top: newScrollTop, behavior: 'smooth' });
      } else {
        // Sync inner scroll with outer scroll position
        const contentScrollTop = content.scrollTop;
        const contentScrollPercentage = contentScrollTop / (content.scrollHeight - content.clientHeight);
        const newGridScrollTop = contentScrollPercentage * (gridScrollHeight - gridClientHeight);
        if (newGridScrollTop !== gridScrollTop) {
          grid.scrollTo({ top: newGridScrollTop, behavior: 'smooth' });
        }
      }
    }

  ionViewDidEnter() {
   // debugger
    const grid = document.querySelector('ion-grid.p-b-0') as HTMLElement;
    if (grid) {
      const gridHeight = grid.offsetHeight;
      console.log('Grid Height:', gridHeight);
      if (gridHeight > 0) {
        this.heightService.setGridHeight(gridHeight);
      } else {
        // Retry if height is 0 (content not fully rendered)
        setTimeout(() => {
          const retryHeight = grid.offsetHeight;
          console.log('Grid Height (Retry):', retryHeight);
          this.heightService.setGridHeight(retryHeight);
        }, 100);
      }
    } else {
      console.error('Could not find ion-grid.p-b-0 in DOM');
      // Fallback to default height
      this.heightService.setGridHeight(250);
    }
  }
}
