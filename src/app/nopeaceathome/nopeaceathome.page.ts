import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-nopeaceathome',
  templateUrl: './nopeaceathome.page.html',
  styleUrls: ['./nopeaceathome.page.scss'],
  standalone: false
})
export class NopeaceathomePage implements OnInit {
  nopeaceathomeslider:string='/api/no-peaceat-home-sliders';
  nopeaceathometitlecontent:string= '/api/no-peaceat-home';
  constructor() { }

  ngOnInit() {
  }

}
