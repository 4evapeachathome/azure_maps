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
      (data: any) => {
        if (data) {
          this.webImage = data.image; // Assuming single item for simplicity
          this.scenarioData = data.map((item: any) => ({
            title: item.Content.content.find((c: any) =>
              c.type === 'heading' && c.children.some((child: any) => child.bold)
            )?.children[0].text || '',
            content: item.Content.content.map((c: any) => {
              if (c.type === 'list') {
                return {
                  type: c.type,
                  format: c.format, // "unordered" or "ordered"
                  items: c.children.map((listItem: any) => ({
                    type: listItem.type, // "list-item"
                    children: listItem.children
  .filter((child: any) => {
    // Filter out empty text nodes
    return !(child.type === 'text' && (!child.text || child.text.trim() === ''));
  }).map((child: any) => {
                      if (child.type === 'link') {
                        return {
                          type: child.type,
                          url: child.url,
                          children: child.children.map((linkChild: any) => ({
                            text: linkChild.text,
                            bold: linkChild.bold || false,
                            italic: linkChild.italic || false,
                            underline: linkChild.underline || false
                          }))
                        };
                      } else {
                        return {
                          type: child.type,
                          text: child.text,
                          bold: child.bold || false,
                          italic: child.italic || false
                        };
                      }
                    })
                  }))
                };
              } else {
                return {
                  type: c.type, // "heading" or "paragraph"
                  level: c.level || undefined, // For headings (e.g., level: 3 for h3)
                  children: c.children.map((child: any) => ({
                    text: child.text,
                    bold: child.bold || false,
                    italic: child.italic || false
                  }))
                };
              }
            })
          }));
        }
        console.log('Processed scenario data:', this.scenarioData);
      },
      (error) => console.error('Error loading data:', error)
    );
  }

}
