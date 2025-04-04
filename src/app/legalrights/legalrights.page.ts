import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-legalrights',
  templateUrl: './legalrights.page.html',
  styleUrls: ['./legalrights.page.scss'],
  standalone: false
})
export class LegalrightsPage implements OnInit {
  selectedState: any = null;

 
  constructor() { }

  ngOnInit() {
  }


}
