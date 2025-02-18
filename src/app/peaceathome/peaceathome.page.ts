import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-peaceathome',
  templateUrl: './peaceathome.page.html',
  styleUrls: ['./peaceathome.page.scss'],
  standalone: false,
})
export class PeaceathomePage implements OnInit {
  peaceathomeslider:string = '/api/peace-at-home-sliders';
  constructor() { }

  ngOnInit() {
  }

}
