import { AfterViewInit, Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
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
  sliderEndpoint:string = APIEndpoints.sliderapi;
  @ViewChild('ionGrid', { static: false }) ionGrid!: ElementRef;
  constructor(private heightService: HeightService) {}

  ngAfterViewInit() {
    if (this.ionGrid) {
      const gridHeight = this.ionGrid.nativeElement.offsetHeight;
      this.heightService.updateHeight(gridHeight); // Send height to service
    }
  }
}
