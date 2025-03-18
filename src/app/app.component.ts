import { AfterViewInit, Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { MenuComponent } from './components/menu/menu.component';
import { FooterComponent } from './controls/footer/footer.component';
import { HeaderComponent } from "./controls/header/header.component";
import { HeightService } from 'src/shared/height.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonicModule, MenuComponent, FooterComponent, HeaderComponent]
})
export class AppComponent implements AfterViewInit {
  @ViewChild('divScroll', { static: false }) divScroll!: ElementRef;

  constructor(private renderer: Renderer2, private heightService: HeightService) {}

  ngAfterViewInit() {
    this.heightService.currentHeight.subscribe((height) => {
      if (this.divScroll) {
        this.renderer.setStyle(this.divScroll.nativeElement, 'min-height', `${height}px`);
      }
    });
  }
}
