import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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

  constructor(private apiService: ApiService,private router: Router) {}

  ngOnInit() {
    this.loadTypesOfAbuse();
  }

  navigateToPeaceAtHome() {
    this.router.navigate(['/typesofabuse']); // Adjust the route path as needed
  }

  loadTypesOfAbuse() {
    this.apiService.getTypesOfAbuse().subscribe(
      (data) => {
        if (data && data.AbuseGallery) {
          this.abuseGallery = data.AbuseGallery;
          this.title = data.title;
        }
      },
      (error) => {
        console.error('Error loading types of abuse:', error);
      }
    );
  }



}
