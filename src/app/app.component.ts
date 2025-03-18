import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { MenuComponent } from './components/menu/menu.component';
import { FooterComponent } from './controls/footer/footer.component';
import { HeaderComponent } from "./controls/header/header.component";
import { HeightService } from 'src/shared/height.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonicModule, MenuComponent, FooterComponent, HeaderComponent]
})
export class AppComponent implements OnInit,OnDestroy {
  minHeight: string = '250px';
  private heightSubscription!: Subscription;

  constructor(private heightService: HeightService) {}

  ngOnInit() {
    debugger
    this.heightSubscription = this.heightService.gridHeight$.subscribe(({ height, isReady }) => {
      console.log('HeightService Update:', { height, isReady });
      if (isReady && height > 0) {
        this.minHeight = `${height}px`;
        console.log('divHeight set to:', this.minHeight);
      }
    });
  }

  ngOnDestroy() {
    if (this.heightSubscription) {
      this.heightSubscription.unsubscribe();
    }
  }
}
