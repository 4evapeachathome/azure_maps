import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-wellness-tips',
  templateUrl: './wellness-tips.component.html',
  styleUrls: ['./wellness-tips.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class WellnessTipsComponent  implements OnInit {
  tips: { id: number; wellnesstips: string }[] = [];
  currentTip: string = '';
  HealthTipTitle: string = '';
  HealthTipImageUrl: string = '';
  constructor(private apiService: ApiService) { }

  ngOnInit() {
    this.fetchWellnessTip();
  }

  fetchWellnessTip() {
    this.apiService.getWellnessTip().subscribe(
      (response) => {
        debugger;
        if (response && response.length > 0) {
          this.HealthTipTitle = response[0].HealthTipsTitle;
        this.currentTip = response[0].HealthTipsDescription
        this.HealthTipImageUrl = response[0].image;

        } else {
          console.warn('No data found');
          this.HealthTipTitle = ''
          this.currentTip = ''
          this.HealthTipImageUrl = ''
        }
      },
      (error) => {
        console.error('Error fetching wellness tip:', error);
      }
    );
  }




}
