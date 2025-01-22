import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';


@Component({
  selector: 'app-happy-home',
  templateUrl: './happy-home.component.html',
  styleUrls: ['./happy-home.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
 
})



export class HappyHomeComponent  implements OnInit {
   bannerTitle: string ='';
   bannerTitleHighlight: string = '';
   bannerDescription: string= '';
   bannerWebImage: any = '';
  constructor(private apiService: ApiService) { }

  ngOnInit() {
    this.fetchHappyHomeData();
  }

  fetchHappyHomeData(): void {
    this.apiService.getHappyHomeQuote().subscribe(
      (response) => {

        if (response && response.length > 0) {
          const firstBanner = response[0];
      
          this.bannerTitle = firstBanner.BannerTitle || ''; 
          this.bannerTitleHighlight = firstBanner.BannerTitleHighlight || '';
          this.bannerDescription = firstBanner.BannerDescription || '';
          this.bannerWebImage = firstBanner.image || ''; 
        } else {
          console.warn('No banners found in the response.');
          this.bannerTitle = '';
          this.bannerTitleHighlight = '';
          this.bannerDescription = '';
          this.bannerWebImage = '';
        }
      },
      (error) => {
        console.error('Error fetching happy home data:', error);
      }
    );
  }
}
