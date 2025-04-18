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

  constructor(private apiService:ApiService) { }

  ngOnInit() {
    this.loadTypesOfAbuse();
  }

  loadTypesOfAbuse() {
    this.apiService.getCriminalizationOfSurvivors().subscribe(
      (data) => {
        if (data) {
         // debugger;
          this.contentBlocks = data.contentBlock;
          this.webImages = data.imageList;
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
