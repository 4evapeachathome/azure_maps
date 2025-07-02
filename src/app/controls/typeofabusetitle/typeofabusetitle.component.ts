import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
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
   @Output() loaded = new EventEmitter<void>();

  constructor(private apiService:ApiService) { }

  ngOnInit() {
    this.getTypesofabuseTitle();
  }

  getHeadingLevelClass(level: number): string {
    switch (level) {
      case 1: return 'cb-headeing-1';
      case 2: return 'cb-headeing-2';
      case 3: return 'cb-headeing-3';
      default: return '';
    }
  }


  getTypesofabuseTitle() {
    this.apiService.getTypesofabusesTitle().subscribe(
      (response) => {
        const data = response;
        if (data) {
          this.img = data.image;
          this.title = Array.isArray(data.title) ? data.title : [];
        }
        this.loaded.emit(); // Emit loaded event after data is fetched
      },
      (error) => {
        console.error('Error fetching api data:', error);
        this.loaded.emit(); 
      }
    );
  }

}
