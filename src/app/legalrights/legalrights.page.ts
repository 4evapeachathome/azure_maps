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

  onStateClick(state: { id: string; name: string; path: string }) {
   // debugger;
    this.selectedState = state; // Update selected state for breadcrumb
    console.log('Selected state:', state.name);
  }

  resetSelectedState() {
   // debugger;
    this.selectedState = null; // Reset state when breadcrumb is clicked
  }
}
