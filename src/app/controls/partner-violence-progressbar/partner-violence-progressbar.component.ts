import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { DeviceDetectorService } from 'ngx-device-detector';
import { ApiService } from 'src/app/services/api.service';
import { LoggingService } from 'src/app/services/logging.service';

interface RichTextChild {
  text?: string; // Optional, as not all nodes have text (e.g., a list-item may only have children)
  type: string;
  children?: RichTextChild[]; // Allow nested children
}

interface RichTextElement {
  type: string;
  level?: number;
  format?: string;
  children: RichTextChild[];
}

interface IpvPartnerViolence {
  id: number;
  multilinerichtextbox: RichTextElement[];
}



@Component({
  selector: 'pathome-partner-violence-progressbar',
  templateUrl: './partner-violence-progressbar.component.html',
  styleUrls: ['./partner-violence-progressbar.component.scss'],
    standalone: true,
    imports: [CommonModule, IonicModule],
})
export class PartnerViolenceProgressbarComponent  implements OnInit {
  @Input() levels: IpvPartnerViolence[] = [];
  device:any;

  constructor(
    private loggingService: LoggingService,
    private deviceService:DeviceDetectorService,
  ) {
    this.device = this.deviceService.getDeviceInfo();
  }

  ngOnInit() {}

  getHeadingText(level: IpvPartnerViolence): string {
    const heading = level.multilinerichtextbox.find(item => item.type === 'heading');
    return heading?.children?.[0]?.text ?? 'Unknown Level';
  }

  getLevelNumber(level: IpvPartnerViolence): number {
    const headingText = this.getHeadingText(level);
    const levelNumber = parseInt(headingText.split(' ')[1], 10) || 0;
    return levelNumber;
  }

  getDescription(level: IpvPartnerViolence): string {
  try {
    return level.multilinerichtextbox
      .map((item) => {
        if (item.type === 'paragraph' && item.children) {
          return item.children.map((child) => child.text).join(' ');
        } else if (item.type === 'list' && item.format === 'unordered' && Array.isArray(item.children)) {
          return `<ul>` +
            item.children
              .map((listItem) => {
                if (listItem.children && Array.isArray(listItem.children)) {
                  return `<li>${listItem.children.map((child) => child.text).join(' ')}</li>`;
                }
                return '';
              })
              .join('') +
            `</ul>`;
        }
        return '';
      })
      .join('');
  } catch (error) {
    console.error('Error generating IPV description:', error);

    this.loggingService.handleApiErrorEducationModule(
      'Failed to generate IPV description content',
      'getDescription',
      '',
      '',
      (error as any)?.message || 'Unknown error',
      500,
      this.device
    );

    return '';
  }
}

  

  getListItems(level: IpvPartnerViolence): string[] {
  try {
    const lists = level.multilinerichtextbox.filter((item) => item.type === 'list');
    return lists
      .map((list) => {
        const listItem = list.children[0];
        if (listItem && listItem.type === 'list-item' && listItem.children && listItem.children.length > 0) {
          const textNode = listItem.children[0];
          return textNode && textNode.type === 'text' && textNode.text ? textNode.text : '';
        }
        return '';
      })
      .filter((text) => text !== '');
  } catch (error) {
    console.error('Error extracting IPV list items:', error);

    this.loggingService.handleApiErrorEducationModule(
      'Failed to extract IPV list items',
      'getListItems',
      '',
      '',
      (error as any)?.message || 'Unknown error',
      500,
      this.device
    );

    return [];
  }
}


  getProgressBarClasses(levelNumber: number): string[] {
    if (levelNumber === 1) return ['yellow'];
    if (levelNumber === 2) return ['yellow', 'orange'];
    if (levelNumber === 3) return ['yellow', 'orange', 'red'];
    return [];
  }

}
