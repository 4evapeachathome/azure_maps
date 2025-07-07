import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { DeviceDetectorService } from 'ngx-device-detector';
import { ApiService } from 'src/app/services/api.service';
import { LoggingService } from 'src/app/services/logging.service';

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
  device:any;
  @Input() contentPlacement:string = 'right';
  @Input() endPoint:string = '';
  @Output() loaded = new EventEmitter<void>();

  constructor(
       private loggingService: LoggingService,
  private deviceService:DeviceDetectorService,private apiService:ApiService) {
    this.device = this.deviceService.getDeviceInfo(); // Initialize device info
   }

  ngOnInit() {
    this.GetUnhealthyrelationcontentone(this.endPoint);
  }

 GetUnhealthyrelationcontentone(endPoint: string) {
  this.apiService.UnhealthyRelationshipContents(endPoint).subscribe(
    (data: any) => {
      if (data && data.length > 0) {
        this.webImage = data.image;
        this.scenarioData = data.map((item: any) => {
          const allContent = item.Content.content;

          const processedContent: any[] = [];
          let tempListItems: any[] = [];

          allContent.forEach((c: any, index: number) => {
            if (c.type === 'list' && c.format === 'unordered') {
              const listItems = c.children.map((listItem: any) => ({
                type: listItem.type,
                children: listItem.children.map((child: any) => {
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
              }));

              tempListItems.push(...listItems);

              const next = allContent[index + 1];
              if (!next || next.type !== 'list' || next.format !== 'unordered') {
                processedContent.push({
                  type: 'list',
                  format: 'unordered',
                  items: [...tempListItems]
                });
                tempListItems = [];
              }
            } else {
              if (tempListItems.length > 0) {
                processedContent.push({
                  type: 'list',
                  format: 'unordered',
                  items: [...tempListItems]
                });
                tempListItems = [];
              }

              processedContent.push({
                type: c.type,
                level: c.level || undefined,
                children: c.children.map((child: any) => ({
                  text: child.text,
                  bold: child.bold || false,
                  italic: child.italic || false
                }))
              });
            }
          });

          return {
            title: allContent.find((c: any) =>
              c.type === 'heading' && c.children.some((child: any) => child.bold)
            )?.children[0].text || '',
            content: processedContent
          };
        });
      }
      this.loaded.emit(); // Emit the loaded event after fetching data
    },
    (error) => {
      console.error('Error loading data:', error);

      this.loggingService.handleApiErrorEducationModule(
        'Failed to load unhealthy relationship content block',
        'GetUnhealthyrelationcontentone',
        endPoint, // replace with actual constant if needed
        '', // documentId intentionally left empty
        error?.error?.error?.message || error?.message || 'Unknown error',
        error?.status || 500,
        this.device
      );

      this.loaded.emit();
    }
  );
}

  

}
