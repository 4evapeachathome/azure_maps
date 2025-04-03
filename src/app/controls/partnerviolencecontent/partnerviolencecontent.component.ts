import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { BreadcrumbComponent } from "../breadcrumb/breadcrumb.component";
import { CommonModule } from '@angular/common';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'pathome-partnerviolencecontent',
  templateUrl: './partnerviolencecontent.component.html',
  styleUrls: ['./partnerviolencecontent.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, BreadcrumbComponent]
})
export class PartnerviolencecontentComponent  implements OnInit {

partnerviolenceimg: string='';
 contentBlocks: any[] = [];
  titleContent: any;
  titleparaContent: any;
  paragraphContent: any;
  constructor(private apiService:ApiService) { }

  ngOnInit() {
    this.getPartnerViolenceTitle();
  }

  getPartnerViolenceTitle(){
    this.apiService.getPartnerViolenceTitle().subscribe(
      (response) => {
        if (response && response.image && response.title && response.ContentBlocks) {
          this.partnerviolenceimg = response.image;
          this.titleContent = response.title;
          this.titleparaContent= response.titleContent;
          this.contentBlocks = response.ContentBlocks;
        this.paragraphContent = response.title[1]?.children[0]?.text || '';
        }
      },
      (error) => {
        console.error('Error fetching partner violence content:', error);
      }
    );
  }

}
