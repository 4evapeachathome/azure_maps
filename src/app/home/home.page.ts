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
export class HomePage {
  sliderEndpoint:string = APIEndpoints.sliderapi;

  constructor(private heightService: HeightService,
    private el: ElementRef,
    private ngZone: NgZone) {}

  // ngAfterViewInit() {
  //   debugger
  //   // Calculate the height based on content
  //   setTimeout(() => {
  //     const contentHeight = this.el.nativeElement.scrollHeight;
  //     // Add some padding if needed
  //     this.heightService.setHeight(contentHeight + 50);
  //   }, 100);
  // }

  ionViewDidEnter() {
    debugger
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
