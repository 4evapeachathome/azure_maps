import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'pathome-nopeacehomescenarioone',
  templateUrl: '../nopeacehome-scenario-one/nopeacehomescenarioone.component.html',
  styleUrls: ['../nopeacehome-scenario-one/nopeacehomescenarioone.component.scss'],
     standalone: true,
        imports: [CommonModule, IonicModule]
})
export class NopeacehomescenariooneComponent implements OnInit {
  scenarioData: any = [];
  webImage:any;
  contentPlacement:string = 'right';

  constructor(private apiService:ApiService) { }

  ngOnInit() {
    this.GetNoPeaceHomeScenarioOne();
  }

  GetNoPeaceHomeScenarioOne() {
    this.apiService.getNoPeaceHomeScenarioOne().subscribe(
      (data) => {
        this.webImage = data.image;
        this.scenarioData = data.map((item: any) => ({
          title: item.content.content.find((c: any) => 
            c.children.some((child: any) => child.bold)
          )?.children[0].text || '',
          
          description: item.content.content.map((c: any) =>
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
