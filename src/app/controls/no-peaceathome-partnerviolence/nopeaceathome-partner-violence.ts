import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'pathome-nopeaceathome-partnerviolence',
  templateUrl: '../healthyrelationshipcontent/healthyrelationshipcontent.component.html',
  styleUrls: ['../healthyrelationshipcontent/healthyrelationshipcontent.component.scss'],
   standalone: true,
        imports: [CommonModule, IonicModule]
})
export class UnHealthyrelationshipcontentComponent  implements OnInit {
  content: any[] = [];
  isBtnVisible: boolean = true;
  constructor(private apiService:ApiService) { }

  ngOnInit() {
    this.getNoPeaceHomePartnerviolnece();
  }

  getNoPeaceHomePartnerviolnece(){
    this.apiService.getNopeacepartnerViolence().subscribe(
      (response) => {
       // debugger;
        if (response?.data?.length > 0) {
          // Filter out empty paragraphs
          this.content = response.data[0].content.filter((item:any) => 
            item.children[0]?.text.trim().length > 0
          );
        }
      },
      (error) => {
        console.error('Error fetching no peace at home partnerviolence data:', error);
      }
    );
  }

}
