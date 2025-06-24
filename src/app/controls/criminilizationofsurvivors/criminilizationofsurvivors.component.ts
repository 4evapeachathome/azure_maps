import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'pathome-criminilizationofsurvivors',
  templateUrl: './criminilizationofsurvivors.component.html',
  styleUrls: ['./criminilizationofsurvivors.component.scss'],
      imports: [CommonModule, IonicModule]
  
})
export class CriminilizationofsurvivorsComponent  implements OnInit {
  contentBlocks: any[] = [];
  webImages: any[] = [];
  isLoaded: boolean = false;
  firstGroupBlocks:any;
  secondGroupBlocks:any;

  constructor(private apiService:ApiService) { }

  ngOnInit() {
    this.loadTypesOfAbuse();
  }

  loadTypesOfAbuse() {
    this.apiService.getCriminalizationOfSurvivors().subscribe(
      (data) => {
        if (data) {
          this.contentBlocks = data.contentBlock;
          this.webImages = data.imageList;

          const startIndexOfC = this.contentBlocks.findIndex(
            block =>
              block.type === 'heading' &&
              block.children?.[0]?.text?.trim()?.startsWith('C. ')
          );
          
          // If found, split into two groups
          if (startIndexOfC !== -1) {
            this.firstGroupBlocks = this.contentBlocks.slice(0, startIndexOfC);
            this.secondGroupBlocks = this.contentBlocks.slice(startIndexOfC);
          } else {
            // fallback if "C." heading not found
            this.firstGroupBlocks = this.contentBlocks;
            this.secondGroupBlocks = [];
          }

          this.isLoaded = true;
        }
      },
      (error) => {
        console.error('Error loading getCriminalizationOfSurvivors api data:', error);
      }
    );
  }

  getImageUrl(index: number): string {
    return this.webImages?.[index]?.fullUrl || '';
  }


}
