import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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
  @Output() loaded = new EventEmitter<void>();

  constructor(private apiService:ApiService) { }

  ngOnInit() {
    this.getHealthyRelationshipData(this.endpoint);
  }

  getHeadingLevelClass(level: number): string {
    debugger;
    switch (level) {
      case 1: return 'cb-headeing-1';
      case 2: return 'cb-headeing-2';
      case 3: return 'cb-headeing-3';
      default: return '';
    }
  }


  getHealthyRelationshipData(endpoint: string) {
    this.apiService.getHealthyRelationship(endpoint).subscribe(
      (response) => {
        const data = response;
        if (data) {
          this.img = data.image;
          this.title = Array.isArray(data.title) ? data.title : [];
          debugger;
          // Handle both contentBlocks and ContentBlocks for compatibility
          const blocks = data.contentBlocks || data.ContentBlocks;
          if (blocks) {
            this.contentBlocks = Array.isArray(blocks) ? blocks : [blocks];
  
            // Merge all unordered lists into one
            this.contentBlocks.forEach(block => {
              if (Array.isArray(block.multilinerichtextbox)) {
                const listItems = block.multilinerichtextbox
                  .filter((item:any) => item.type === 'list' && item.format === 'unordered')
                  .flatMap((item:any) => item.children || []);
  
                const nonListItems = block.multilinerichtextbox
                  .filter((item:any) => !(item.type === 'list' && item.format === 'unordered'));
  
                if (listItems.length > 0) {
                  nonListItems.push({
                    type: 'list',
                    format: 'unordered',
                    children: listItems
                  });
                }
  
                block.multilinerichtextbox = nonListItems;
              }
            });
  
          } else {
            this.contentBlocks = [];
          }
  
          //this.paragraphContent = data.title?.[1]?.children?.[0]?.text || '';
        }
        this.loaded.emit(); // Emit the loaded event after fetching data
      },
      (error) => {
        console.error('Error fetching api data:', error);
        this.loaded.emit(); 
      }
    );
  }
  

}
