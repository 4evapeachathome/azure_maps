import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { BreadcrumbComponent } from "../breadcrumb/breadcrumb.component";

@Component({
  selector: 'pathome-healthyrelatitonship',
  templateUrl: './healthyrelatitonship.component.html',
  styleUrls: ['./healthyrelatitonship.component.scss'],
   standalone: true,
      imports: [CommonModule, IonicModule, BreadcrumbComponent]
})
export class HealthyrelatitonshipComponent  implements OnInit {
  img: any;
  contentBlocks: any[] = [];
  title: any;
  paragraphContent: any;
  @Input() endpoint:string = '';

  constructor(private apiService:ApiService) { }

  ngOnInit() {
    this.getHealthyRelationshipData(this.endpoint);
  }



  getHealthyRelationshipData(endpoint : string){
    this.apiService.getHealthyRelationship(endpoint).subscribe(
      (response) => {
        if (response && response.image && response.title && response.contentBlocks) {
          this.img = response.image;
          this.title = response.title;
          this.contentBlocks = response.contentBlocks;
        this.paragraphContent = response.title[1]?.children[0]?.text || '';
        }
      },
      (error) => {
        console.error('Error fetching healthy relationship data:', error);
      }
    );
  }

}
