import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'pathome-healthyrelatitonship',
  templateUrl: './healthyrelatitonship.component.html',
  styleUrls: ['./healthyrelatitonship.component.scss'],
   standalone: true,
      imports: [CommonModule, IonicModule]
})
export class HealthyrelatitonshipComponent  implements OnInit {
  img: any;
  contentBlocks: any[] = [];
  title: any;
  paragraphContent: any;

  constructor(private apiService:ApiService) { }

  ngOnInit() {
    this.getHealthyRelationshipData();
  }



  getHealthyRelationshipData(){
    this.apiService.getHealthyRelationship().subscribe(
      (response) => {
     //   debugger;
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
