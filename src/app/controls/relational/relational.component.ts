import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ApiService } from '../../services/api.service'; 

@Component({
  selector: 'app-relational',
  templateUrl: './relational.component.html',
  styleUrls: ['./relational.component.scss'],
  standalone: true,
  imports: [CommonModule,  IonicModule],
})
export class RelationalComponent  implements OnInit {
  personalItems: any[] = [];
  interpersonalItems: any[] = [];

  constructor(private apiService: ApiService) { }

  async ngOnInit() {
    try {
      // Fetching Personal and Interpersonal items from Strapi
      const data = await this.apiService.getRelationalContent().toPromise();
      
      if (data && data.data && data.data[0]) {
        this.personalItems = data.data[0].Personal || [];
        this.interpersonalItems = data.data[0].Interpersonal || [];
      }
    } catch (err) {
      console.error('Error in fetching Personal and Interpersonal items from Strapi:', err);
    }
  }

}
