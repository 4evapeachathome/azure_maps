import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'pathome-healthyrelationshipcontent',
  templateUrl: './healthyrelationshipcontent.component.html',
  styleUrls: ['./healthyrelationshipcontent.component.scss'],
   standalone: true,
        imports: [CommonModule, IonicModule, RouterModule]
})
export class HealthyrelationshipcontentComponent  implements OnInit {
  content: any[] = [];
 @Input() isBtnVisible: boolean = false;
 @Input() endpoint: string='';
 @Input() routerLink: string | string[] = [];
 @Output() loaded = new EventEmitter<void>();
  constructor(private apiService:ApiService) { }

  ngOnInit() {
    this.getHealthyRelationshipContent(this.endpoint);
  }

  getHealthyRelationshipContent(endpoint: string) {
    this.apiService.getHealthyRelationShipContent(endpoint).subscribe(
      (response) => {
        if (response?.data?.length > 0) {
          // Keep all paragraphs, including empty ones
          this.content = response.data[0].content;
        }
        this.loaded.emit(); // Emit the loaded event after fetching data
      },
      (error) => {
        console.error('Error fetching healthy relationship data:', error);
        this.loaded.emit(); 
      }
    );
  }

}
