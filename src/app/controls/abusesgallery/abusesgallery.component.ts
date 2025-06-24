import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'pathome-abusesgallery',
  templateUrl: './abusesgallery.component.html',
  styleUrls: ['./abusesgallery.component.scss'],
    standalone: true,
      imports: [CommonModule, IonicModule, RouterModule]
  
})
export class AbusesgalleryComponent  implements OnInit {
  abuseGallery: any[] = [];
  title:any;
  @Output() loaded = new EventEmitter<void>();

  constructor(private apiService: ApiService,private router: Router) {}

  ngOnInit() {
    this.loadTypesOfAbuse();
  }

  navigateAbuse(section: string): void {
  this.router.navigate(['/typesofabuse'], {
    queryParams: { section }
  });
}

  loadTypesOfAbuse() {
    this.apiService.getTypesOfAbuse().subscribe(
      (data) => {
        if (data && data.AbuseGallery) {
          this.abuseGallery = data.AbuseGallery;
          this.title = data.title;
        }
        this.loaded.emit(); // Emit loaded event after data is fetched
      },
      (error) => {
        console.error('Error loading types of abuse:', error);
        this.loaded.emit(); // Emit loaded event even if there's an error
      }
    );
  }



}
