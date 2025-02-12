import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'pathome-healthyrelationshipcontent',
  templateUrl: './healthyrelationshipcontent.component.html',
  styleUrls: ['./healthyrelationshipcontent.component.scss'],
   standalone: true,
        imports: [CommonModule, IonicModule]
})
export class HealthyrelationshipcontentComponent  implements OnInit {
  content: any[] = [];
  isBtnVisible: boolean = false;
  constructor(private apiService:ApiService) { }

  ngOnInit() {
    this.getHealthyRelationshipContent();
  }

  getHealthyRelationshipContent(){
    this.apiService.getHealthyRelationShipContent().subscribe(
      (response) => {
      //  debugger;
        if (response?.data?.length > 0) {
          // Filter out empty paragraphs
          this.content = response.data[0].content.filter((item:any) => 
            item.children[0]?.text.trim().length > 0
          );
        }
      },
      (error) => {
        console.error('Error fetching healthy relationship data:', error);
      }
    );
  }

}
