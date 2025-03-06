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
  title: any[] = [];
  paragraphContent: any;
  @Input() endpoint:string = '';

  constructor(private apiService:ApiService) { }

  ngOnInit() {
    this.getHealthyRelationshipData(this.endpoint);
  }



  getHealthyRelationshipData(endpoint: string) {
    this.apiService.getHealthyRelationship(endpoint).subscribe(
      (response) => {
        console.log('API Response:', response);
        const data = response;
        if (data) {
          this.img = data.image;
          this.title = Array.isArray(data.title) ? data.title : [];
          // Handle both contentBlocks and ContentBlocks for compatibility
          const blocks = data.contentBlocks || data.contentBlocks;
          if (blocks) {
            this.contentBlocks = Array.isArray(blocks) ? blocks : [blocks];
          } else {
            this.contentBlocks = [];
          }
          this.paragraphContent = data.title?.[1]?.children?.[0]?.text || '';
        }
      },
      (error) => {
        console.error('Error fetching api data:', error);
      }
    );
  }

}
