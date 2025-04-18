import {Component} from '@angular/core';
import { Router } from '@angular/router';
import { APIEndpoints } from 'src/shared/endpoints';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
  // imports: [IonicModule, MenuComponent]
})
export class HomePage {
  sliderEndpoint:string = APIEndpoints.sliderapi;

  constructor(private router: Router) {}

  navigateToPeaceAtHome() {
    this.router.navigate(['/peaceathome']);
  }
}
