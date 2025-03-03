import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'pathome-unhealthyrelationshipcontent',
  templateUrl: './unhealthyrelationshipcontent.component.html',
  styleUrls: ['./unhealthyrelationshipcontent.component.scss'],
     standalone: true,
        imports: [CommonModule, IonicModule]
})
export class UnhealthyRelationshipContent  implements OnInit {
  scenarioData: any = [];
  webImage:any;
  @Input() contentPlacement:string = 'right';
  @Input() endPoint:string = '';

  constructor(private apiService:ApiService) { }

  ngOnInit() {
    this.GetUnhealthyrelationcontentone(this.endPoint);
  }

  GetUnhealthyrelationcontentone(endPoint: string) {
    this.apiService.UnhealthyRelationshipContents(endPoint).subscribe(
      (data) => {
        this.webImage = data.image;
        this.scenarioData = data.map((item: any) => ({
          title: item.Content.content.find((c: any) => 
            c.children.some((child: any) => child.bold)
          )?.children[0].text || '',
          
          description: item.Content.content.map((c: any) =>
            c.children.map((child: any) => ({
              text: child.text,
              bold: child.bold || false,
              italic: child.italic || false
            }))
          )
        }));
      },
      (error) => console.error('Error loading data:', error)
    );
  }

}
