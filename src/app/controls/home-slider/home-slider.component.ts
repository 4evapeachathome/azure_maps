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
    imports: [CommonModule, IonicModule]
})
export class HomeSliderComponent  implements OnInit {
  currentIndex = 0;
  showButton: boolean = true;
  sliderData: any;
  descriptions: Description[] = [];
  mainTitle: any;
  webImage: any;
  constructor(private apiService:ApiService) { }

  ngOnInit() {
    this.getHomeSlidersData();
  }

  getHomeSlidersData() {
    this.apiService.getHomeSliders().subscribe(
       (response) => {
        if(response && response.length > 0){
          this.sliderData = response[0].homeslider;
          this.descriptions = this.sliderData.description;
          this.mainTitle = response[0].homeslider.title; 
          this.webImage = response[0].image;
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
