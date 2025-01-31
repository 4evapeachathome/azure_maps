import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'pathome-peaceathome',
  templateUrl: './peaceathome.component.html',
  styleUrls: ['./peaceathome.component.scss'],
  standalone: true,
      imports: [CommonModule, IonicModule]
})
export class PeaceathomeComponent  implements OnInit {
 peaceathomeImg: string='';
 contentBlocks: any[] = [];
  titleContent: any;
  paragraphContent: any;
  constructor(private apiService:ApiService) { }

  ngOnInit() {
    this.getPeaceAtHome();
  }

  getPeaceAtHome(){
    this.apiService.getPeaceAtHome().subscribe(
      (response) => {
        debugger;
        if (response && response.image && response.title && response.ContentBlocks) {
          this.peaceathomeImg = response.image;
          this.titleContent = response.title;
          this.contentBlocks = response.ContentBlocks;
        this.paragraphContent = response.title[1]?.children[0]?.text || '';
        }
      },
      (error) => {
        console.error('Error fetching peace at home:', error);
      }
    );
  }


}
