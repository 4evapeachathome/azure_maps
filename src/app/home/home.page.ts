import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { MenuComponent } from '../components/menu/menu.component';
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
  constructor() {}
}
