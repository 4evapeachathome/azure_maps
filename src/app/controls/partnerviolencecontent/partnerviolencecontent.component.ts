import { Component, EventEmitter, OnInit, Output } from '@angular/core';
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
  headingBlock: any;
paragraphBlock: any;
  @Output() loaded = new EventEmitter<void>();
  paragraphContent: any;
  constructor(private apiService:ApiService) { }

  ngOnInit() {
    this.getPartnerViolenceTitle();
  }

  getPartnerViolenceTitle() {
    this.apiService.getPartnerViolenceTitle().subscribe(
      (response) => {
        if (response && response.image && response.title && response.ContentBlocks) {
          this.partnerviolenceimg = response.image;
          this.titleContent = response.title;
          this.contentBlocks = response.ContentBlocks;
          this.titleparaContent= response.titleContent;
          // Extract heading and paragraph dynamically
          this.headingBlock = response.title.find((block: any) => block.type === 'heading');
          this.paragraphBlock = response.title.find((block: any) => block.type === 'paragraph');
        }
        this.loaded.emit();
      },
      (error) => {
        console.error('Error fetching partner violence content:', error);
        this.loaded.emit();
      }
    );
  }

  getHeadingLevelClass(level: number): string {
    switch (level) {
      case 1: return 'cb-headeing-1';
      case 2: return 'cb-headeing-2';
      case 3: return 'cb-headeing-3';
      default: return '';
    }
  }

}
