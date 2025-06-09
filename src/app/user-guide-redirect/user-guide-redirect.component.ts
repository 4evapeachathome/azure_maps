import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-user-guide-redirect',
  templateUrl: './user-guide-redirect.component.html',
  styleUrls: ['./user-guide-redirect.component.scss'],
})
export class UserGuideRedirectComponent  implements OnInit {

  constructor() { }

  ngOnInit() {
    window.location.href = '/assets/user-guide/index.html';
  }
}
