import { Component, OnInit } from '@angular/core';
import { APIEndpoints } from 'src/shared/endpoints';

@Component({
  selector: 'app-federallaw',
  templateUrl: './federallaw.page.html',
  styleUrls: ['./federallaw.page.scss'],
  standalone:false
})
export class FederallawPage implements OnInit {
  public readonly federallawbannercontent : string =APIEndpoints.federallawbannercontent;
  public readonly uvisa : string =APIEndpoints.uvisa;
  public readonly tvisa : string =APIEndpoints.tvisa;
  public readonly childwaiver : string =APIEndpoints.childwaiver;
  public readonly immigrationbenfit : string =APIEndpoints.immigrationbenfit;

  constructor() { }

  ngOnInit() {
  }

}
