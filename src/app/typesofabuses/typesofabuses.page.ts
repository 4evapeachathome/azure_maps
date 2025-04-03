import { Component, OnInit } from '@angular/core';
import { APIEndpoints } from 'src/shared/endpoints';

@Component({
  selector: 'app-typesofabuses',
  templateUrl: './typesofabuses.page.html',
  styleUrls: ['./typesofabuses.page.scss'],
  standalone: false
})
export class TypesofabusesPage implements OnInit {
  
  ipvtypesofabusesendpoint:string=APIEndpoints.ipvtypesofabuses;

  constructor() { }

  ngOnInit() {
  }

}
