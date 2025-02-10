import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import {Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';

interface MultilineRichText {
  type: string;
  level?: number;
  children: {
    text: string;
    type: string;
    bold?: boolean;
    italic?: boolean;
  }[];
}

interface Description {
  id: number;
  multilinerichtextbox: MultilineRichText[];
}

@Component({
  selector: 'pathome-healthyrelationship-slider',
  templateUrl: '../home-slider/home-slider.component.html',
  styleUrls: ['../home-slider/home-slider.component.scss'],
  standalone: true,
    imports: [CommonModule, IonicModule],
     animations: [
          trigger('fadeAnimation', [
            transition(':enter', [
              style({ opacity: 0, transform: 'translateX(20px)' }),
              animate('500ms ease-in-out', style({ opacity: 1, transform: 'translateX(0)' }))
            ]),
            transition(':leave', [
              animate('500ms ease-in-out', style({ opacity: 0, transform: 'translateX(-20px)' }))
            ])
          ]),
          trigger('slideAnimation', [
            transition(':enter', [
              style({ opacity: 0, transform: 'scale(0.9)' }),
              animate('600ms cubic-bezier(0.25, 0.46, 0.45, 0.94)', 
                style({ opacity: 1, transform: 'scale(1)' }))
            ])
          ])
        ]
})
export class HealthyRelationshipSliderComponent  implements OnInit {
  currentIndex = 0;
  showButton: boolean= false;
  sliderData: any;
  descriptions: Description[] = [];
  mainTitle: any;
  webImage: any;
  constructor(private apiService:ApiService) { }

  ngOnInit() {
    this.getHealthyRelationshipSlidersData();
  }

  getHealthyRelationshipSlidersData() {
    this.apiService.getHealthyRelationshipSliders().subscribe(
       (response) => {
        if(response && response.length > 0){
          this.sliderData = response[0].HealthyRelationshipSlider;
          this.descriptions = this.sliderData.description;
          this.mainTitle = response[0].peaceathomeslider.title; 
          this.webImage = response[0].image;
        }
        
       },
       (error) => {
         console.error('Error fetching peace at home slider component:', error);
       }
     );
   }


   prevSlide() {
    this.currentIndex = this.currentIndex === 0 ? this.descriptions.length - 1 : this.currentIndex - 1;
  }

  nextSlide() {
    this.currentIndex = this.currentIndex === this.descriptions.length - 1 ? 0 : this.currentIndex + 1;
  }

  
  getStyledText(child: any): string {
    let text = child.text;
    if (child.bold) text = `<strong>${text}</strong>`;
    if (child.italic) text = `<em>${text}</em>`;
    return text;
  }

  
}
