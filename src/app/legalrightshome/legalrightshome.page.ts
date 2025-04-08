import { Component, OnInit } from '@angular/core';
import { APIEndpoints } from 'src/shared/endpoints';

@Component({
  selector: 'app-legalrightshome',
  templateUrl: './legalrightshome.page.html',
  styleUrls: ['./legalrightshome.page.scss'],
  standalone: false
})
export class LegalrightshomePage implements OnInit {
  legalrightsbannercontent: string = APIEndpoints.legalrightsbannercontent;
  constructor() { }

  ngOnInit() {
  }

}
