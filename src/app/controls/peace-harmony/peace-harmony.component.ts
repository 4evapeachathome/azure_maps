import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'pathome-peace-harmony',
  templateUrl: './peace-harmony.component.html',
  styleUrls: ['./peace-harmony.component.scss'],
  standalone: true,
    imports: [CommonModule, IonicModule,RouterModule]
})
export class PeaceHarmonyComponent  implements OnInit {
title: any;
description:any;
image:any;

  constructor(private apiService:ApiService) { }

  ngOnInit() {
    this.getExpertAdviceData();
  }


  getExpertAdviceData() {
   this.apiService.getExpertAdvice().subscribe(
      (response) => {
        if (response && response.length > 0) {
          const firstBanner = response[0];
      
          this.title = firstBanner.title || ''; 
          this.description = firstBanner.description || '';
          this.image = firstBanner.image || ''; 
        } else {
          console.warn('No data found in the response.');
          this.title = '';
          this.description = '';
          this.image = '';
        }
      },
      (error) => {
        console.error('Error fetching expert advice data:', error);
      }
    );
  }

}
