import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { BreadcrumbComponent } from "../breadcrumb/breadcrumb.component";

@Component({
  selector: 'pathome-typeofabusetitle',
  templateUrl: './typeofabusetitle.component.html',
  styleUrls: ['./typeofabusetitle.component.scss'],
   standalone: true,
        imports: [CommonModule, IonicModule, BreadcrumbComponent]
})
export class TypeofabusetitleComponent  implements OnInit {
img: any;
  contentBlocks: any[] = [];
  title: any[] = [];
  paragraphContent: any;

  constructor(private apiService:ApiService) { }

  ngOnInit() {
    this.getTypesofabuseTitle();
  }



  getTypesofabuseTitle() {
    this.apiService.getTypesofabusesTitle().subscribe(
      (response) => {
        const data = response;
        if (data) {
          this.img = data.image;
          this.title = Array.isArray(data.title) ? data.title : [];
        }
      },
      (error) => {
        console.error('Error fetching api data:', error);
      }
    );
  }

}
