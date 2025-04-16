import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'pathome-unhealthyrelationexample',
  templateUrl: './unhealthyrelationexample.component.html',
  styleUrls: ['./unhealthyrelationexample.component.scss'],
  standalone: true,
          imports: [CommonModule, IonicModule],
})
export class UnhealthyrelationexampleComponent  implements OnInit {
 title:string = '';
 description:string= '';
 content:any;
  constructor(private apiService: ApiService) { }

  ngOnInit() {
    this.loadunhealthyrelationexampledate();
  }

  loadunhealthyrelationexampledate() {
    this.apiService.getunhealthyrelationexample().subscribe( 
      (res: any) => {
      debugger;
      if(res){
        this.title = res.Title;
        this.description = res.Description;
        this.content = res.content;
      }
        
      },
      (error) => {
        console.error('Error fetching physical abuse data:', error);
      }
    );
  }

}
