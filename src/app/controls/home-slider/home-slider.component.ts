import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { MenuService } from 'src/shared/menu.service';

@Component({
  selector: 'pathome-home-slider',
  templateUrl: './home-slider.component.html',
  styleUrls: ['./home-slider.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
  animations: [
    trigger('slideAnimation', [
      transition(':enter', [
        style({ 
          opacity: 0, 
          transform: 'translateX(100%)' 
        }),
        animate('500ms ease-out', style({ 
          opacity: 1, 
          transform: 'translateX(0)' 
        }))
      ]),
      transition(':leave', [
        animate('500ms ease-out', style({ 
          opacity: 0, 
          transform: 'translateX(-100%)' 
        }))
      ])
    ])
  ]
})
export class HomeSliderComponent implements OnInit {
  mainTitle: string = ''; // Stores the main title
  @Output() loaded = new EventEmitter<void>();
  descriptions: any[] = []; // Stores slider content
  imageUrls: string[] = []; // Stores image URLs
  currentIndex: number = 0; // To track active slider index
  @Input() showButton: boolean = true;
  sliderData: any;
  @Input() endpoint: string ='';
  @Input() paramName:string = '';
  @Input() routerLink: string | string[] = [];
  @Input() routerLinkTitle!: string;
 
  constructor(private apiService:ApiService, private menuService:MenuService) { }

  ngOnInit() {
    this.getHomeSlidersData(this.endpoint, this.paramName);
  }


  expandMenu(sectionTitle: string) {
    this.menuService.toggleAdditionalMenus(true, sectionTitle);
  }

  getHomeSlidersData(endpoint: string, paramName: string) {
    this.apiService.getSliders(endpoint,paramName).subscribe(
      (response) => {
        if (response && response.length > 0) {
          const sliderData = response[0][paramName];
  
          // Set the main title
          this.mainTitle = sliderData.title || '';
  
          // Map the descriptions dynamically
          this.descriptions = sliderData.sliderContent.map((content: any) => {
            // Ensure slidercontent is an array, and return it as is (one description per sliderContent)
            return Array.isArray(content.slidercontent) ? content.slidercontent : [];
          });
          // Extract image URLs correctly
          this.imageUrls = sliderData.sliderContent
            .map((content: any) => content.imageUrl)
            .filter((url: any) => !!url); // Fix: Filters out any null/undefined values
  
          // Set default index to show first image & text
          this.currentIndex = 0;
  
        }
        this.loaded.emit();

      },
      (error) => {
        console.error('Error fetching home slider component:', error);
        this.loaded.emit();

      }
    );
  }
  
  onImageLoad(index: number) {
  }


  stopEventPropagation(event: Event): void {
    event.stopPropagation();
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