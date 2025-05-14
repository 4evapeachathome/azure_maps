import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { MenuService } from 'src/shared/menu.service';

interface RichTextBox {
  type: string;
  text: string;
  bold?: boolean;
  children: RichTextBox[];
}

interface BannerTitle {
  multilinerichtextbox: RichTextBox[];
}

@Component({
  selector: 'pathome-happy-home',
  templateUrl: './happy-home.component.html',
  styleUrls: ['./happy-home.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule,RouterModule]
 
})



export class HappyHomeComponent  implements OnInit {
   bannerTitle: BannerTitle | null = null;
   bannerTitleHighlight: string = '';
   content: any;
   bannerDescription: string= '';
   peaceathomeImg: any = '';
  constructor(private apiService: ApiService, private menuService:MenuService) { }

  ngOnInit() {
    this.fetchHappyHomeData();
  }

  expandMenu(sectionTitle: string) {
    this.menuService.toggleAdditionalMenus(true, sectionTitle);
  }

  fetchHappyHomeData(): void {
    this.apiService.getHappyHomeQuote().subscribe(
      (response) => {
        const happyHomeData = response[0];
        this.bannerTitle = happyHomeData.content;
        this.peaceathomeImg = happyHomeData.image;
      },
      (error) => {
        console.error('Error fetching happy home data:', error);
      }
    );
  }
}
