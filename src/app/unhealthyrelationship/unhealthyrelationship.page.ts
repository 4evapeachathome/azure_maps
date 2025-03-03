import { Component, OnInit } from '@angular/core';
import { APIEndpoints } from 'src/shared/endpoints';

@Component({
  selector: 'app-unhealthyrelationship',
  templateUrl: './unhealthyrelationship.page.html',
  styleUrls: ['./unhealthyrelationship.page.scss'],
  standalone: false
})
export class UnhealthyrelationshipPage implements OnInit {
public readonly unhealthyrelationcontent :string = APIEndpoints.unhealthyrelationshipbanner;
public readonly unhealthyrelationslider :string = APIEndpoints.unhealthyrelationshipslider
public readonly unhealthyrelationcontentone :string = APIEndpoints.unhealthyrelationcontentone
public readonly unhealthyrelationcontenttwo :string = APIEndpoints.unhealthyrelationcontenttwo
public readonly unhealthyrelationcontentthree :string = APIEndpoints.unhealthyrelationcontentthree

  constructor() { }

  ngOnInit() {
  }

}
