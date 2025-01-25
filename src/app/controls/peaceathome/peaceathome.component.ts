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
        if (response && response.image && response.Title && response.ContentBlock) {
          this.peaceathomeImg = response.image;
          this.titleContent = response.Title;
          this.contentBlocks = response.ContentBlock;
        this.paragraphContent = response.Title[1]?.children[0]?.text || '';
        }
      },
      (error) => {
        console.error('Error fetching peace at home:', error);
      }
    );
  }


}
