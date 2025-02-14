import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
  selector: 'pathome-home-slider',
  templateUrl: './home-slider.component.html',
  styleUrls: ['./home-slider.component.scss'],
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
export class HomeSliderComponent  implements OnInit {
  mainTitle: string = ''; // Stores the main title
descriptions: any[] = []; // Stores slider content
imageUrls: string[] = []; // Stores image URLs
currentIndex: number = 0; // To track active slider index
  showButton: boolean = true;
  sliderData: any;
 
  constructor(private apiService:ApiService) { }

  ngOnInit() {
    this.getHomeSlidersData();
  }

  getHomeSlidersData() {
    this.apiService.getHomeSliders().subscribe(
      (response) => {
        if (response && response.length > 0) {
          const sliderData = response[0].homeslider;
  
          // Set the main title
          this.mainTitle = sliderData.title || '';
  
          // Map the descriptions dynamically
          this.descriptions = sliderData.sliderContent.map((content: any) => 
            Array.isArray(content.slidercontent) ? content.slidercontent : []
          );
  
          // Extract image URLs correctly
          this.imageUrls = sliderData.sliderContent
            .map((content: any) => content.imageUrl)
            .filter((url: any) => !!url); // Fix: Filters out any null/undefined values
  
          // Set default index to show first image & text
          this.currentIndex = 0;
  
          console.log('Main Title:', this.mainTitle);
          console.log('Descriptions:', this.descriptions);
          console.log('Image URLs:', this.imageUrls);
        }
      },
      (error) => {
        console.error('Error fetching home slider component:', error);
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
