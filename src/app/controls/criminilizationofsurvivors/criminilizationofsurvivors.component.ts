import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
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
  @Output() loaded = new EventEmitter<void>();

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
          this.loaded.emit(); // Emit loaded event after data is fetched
          this.isLoaded = true;
        }
      },
      (error) => {
        console.error('Error loading getCriminalizationOfSurvivors api data:', error);
        this.loaded.emit();
      }
    );
  }

  getImageUrl(index: number): string {
    return this.webImages?.[index]?.fullUrl || '';
  }


}
