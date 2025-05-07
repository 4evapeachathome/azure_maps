import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'pathome-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
   standalone: true,
      imports: [CommonModule, IonicModule,RouterModule],
})
export class HeaderComponent  implements OnInit {
  showExitButton: boolean = true;

  constructor(private router: Router,
    private location: Location) { }

  ngOnInit() {
    this.checkRoute();

    // Subscribe to route changes
    this.router.events.subscribe(() => {
      this.checkRoute();
    });
  }

  private checkRoute() {
    const currentPath = this.location.path();
    this.showExitButton = currentPath !== '/home' && currentPath !== '';
  }

}
