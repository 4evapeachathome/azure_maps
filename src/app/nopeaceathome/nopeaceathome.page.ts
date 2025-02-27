import { Component, OnInit } from '@angular/core';
import { APIEndpoints } from 'src/shared/endpoints';

@Component({
  selector: 'app-nopeaceathome',
  templateUrl: './nopeaceathome.page.html',
  styleUrls: ['./nopeaceathome.page.scss'],
  standalone: false
})
export class NopeaceathomePage implements OnInit {
  nopeaceathomeslider:string=APIEndpoints.nopeaceathomeslider;
  nopeaceathometitlecontent:string= APIEndpoints.nopeaceathometitlecontent;
  nopeacepartnerviolencecontent:string=APIEndpoints.nopeacepartnerviolencecontent;
  constructor() { }

  ngOnInit() {
  }

}
