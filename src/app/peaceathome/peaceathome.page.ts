import { Component, OnInit } from '@angular/core';
import { APIEndpoints } from 'src/shared/endpoints';

@Component({
  selector: 'app-peaceathome',
  templateUrl: './peaceathome.page.html',
  styleUrls: ['./peaceathome.page.scss'],
  standalone: false,
})
export class PeaceathomePage implements OnInit {
  peaceathomeslider:string = APIEndpoints.peaceathomeslider;
  constructor() { }

  ngOnInit() {
  }

}
