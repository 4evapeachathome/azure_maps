import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { IonicModule, Platform } from '@ionic/angular';
import { MenuComponent } from './components/menu/menu.component';
import { FooterComponent } from './controls/footer/footer.component';
import { HeaderComponent } from "./controls/header/header.component";
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StatusBar, Style } from '@capacitor/status-bar';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonicModule, MenuComponent, HeaderComponent, CommonModule]
})
export class AppComponent implements OnInit,OnDestroy {
  isMobile!: boolean;

  constructor(private platform: Platform, private router:Router) {
    this.isMobile = this.platform.is('android') || this.platform.is('ios');
  }

  ngOnInit() {

    this.platform.ready().then(() => {
      // Set overlay to false to prevent content under status bar
      StatusBar.setOverlaysWebView({ overlay: false });
  
      // Optional: Set light/dark content based on your app design
      StatusBar.setStyle({ style: Style.Dark }); // or Style.Light
    });

    const navigationEntries = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
    if (navigationEntries.length > 0 && navigationEntries[0].type === "reload") {
      this.router.navigate(['/home']); // Redirect to home if page is refreshed
    }
  }

  ngOnDestroy() {
  }
}
