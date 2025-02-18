import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-healthyrelationship',
  templateUrl: './healthyrelationship.page.html',
  styleUrls: ['./healthyrelationship.page.scss'],
  standalone: false,
})
export class HealthyrelationshipPage implements OnInit {
healthyrelationslider:string = '/api/healthy-relationship-sliders';
healtyrelationTitleContent:string = '/api/healthy-relationship';
healthyrelationcontentwithoutbutton = '/api/healthyrelationshipcontents';
healthyrelationcontentwithbutton = '/api/unhealthurelationshipcontents';
  constructor() { }

  ngOnInit() {
  }

}
