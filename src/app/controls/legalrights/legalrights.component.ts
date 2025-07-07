import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { BreadcrumbComponent } from "../breadcrumb/breadcrumb.component";
import { DeviceDetectorService } from 'ngx-device-detector';
import { LoggingService } from 'src/app/services/logging.service';

@Component({
  selector: 'pathome-legalrights',
  templateUrl: './legalrights.component.html',
  styleUrls: ['./legalrights.component.scss'],
   standalone: true,
    imports: [CommonModule, IonicModule, RouterModule, BreadcrumbComponent],
})
export class LegalrightsComponent  implements OnInit {
  imageUrl:string = '';
  contentBlocks: any;
  title: any;
  device:any;
  @Input() endpoint:string = '';
  @Output() loaded = new EventEmitter<void>();
  constructor(private apiService:ApiService,
    private loggingService: LoggingService,
    private deviceService:DeviceDetectorService,
    private sanitizer: DomSanitizer) {
    this.device = this.deviceService.getDeviceInfo();
     }

  ngOnInit() {
    this.getLegalRightsData(this.endpoint);
  }

  getHeadingLevelClass(level: number): string {
    switch (level) {
      case 1: return 'cb-headeing-1';
      case 2: return 'cb-headeing-2';
      case 3: return 'cb-headeing-3';
      default: return '';
    }
  }

  getLegalRightsData(endpoint: string) {
  this.apiService.getLegalRightsData(endpoint).subscribe(
    (response) => {
      const data = response;
      if (data) {
        this.imageUrl = data.image || '';
        this.title = Array.isArray(data.title) ? data.title : [];

        // Process contentBlocks with validWebImageIndex
        let validImageCount = 0;
        this.contentBlocks = (data.contentBlocks || []).map((block: any) => {
          const hasWebImage = !!block.webImage;
          const blockData = {
            content: this.sanitizer.bypassSecurityTrustHtml(this.renderBlocks(block.content || [])),
            image: block.image || '',
            webImage: block.webImage,
            validWebImageIndex: hasWebImage ? validImageCount++ : -1
          };
          this.loaded.emit(); // Emit after each block
          return blockData;
        });
      }
    },
    (error) => {
      console.error('Error fetching legal rights data:', error);

      this.loggingService.handleApiErrorEducationModule(
        'Failed to fetch legal rights content',
        'getLegalRightsData',
        endpoint,
        '',
        error?.error?.error?.message || error?.message || 'Unknown error',
        error?.status || 500,
        this.device
      );

      this.loaded.emit(); // Still emit on error
    }
  );
}


  renderBlocks(blocks: any[]): string {
  let html = '';
  let i = 0;

  try {
    while (i < blocks.length) {
      const block = blocks[i];

      // Handle empty paragraph for visual break
      if (
        block.type === 'paragraph' &&
        block.children?.length === 1 &&
        block.children[0].text === ''
      ) {
        html += `<br><br>`;
        i++;
        continue;
      }

      // Group consecutive list items of the same format
      if (block.type === 'list') {
        const listFormat = block.format;
        const listTag = listFormat === 'unordered' ? 'ul' : 'ol';
        html += `<${listTag}>`;

        while (i < blocks.length && blocks[i].type === 'list' && blocks[i].format === listFormat) {
          const listItem = blocks[i];
          for (const item of listItem.children) {
            html += `<li>${this.parseChildren(item.children)}</li>`;
          }
          i++;
        }

        html += `</${listTag}>`;
        continue;
      }

      // Handle other block types
      switch (block.type) {
        case 'heading':
          const tag = `h${block.level}`;
          html += `<${tag}>${this.parseChildren(block.children)}</${tag}>`;
          break;

        case 'paragraph':
          html += `<p>${this.parseChildren(block.children)}</p>`;
          break;

        case 'link':
          const href = block.url || '#';
          html += `<a href="${href}" target="_blank">${this.parseChildren(block.children)}</a>`;
          break;

        default:
          break;
      }

      i++;
    }
  } catch (error) {
    console.error('Error rendering blocks:', error);

    this.loggingService.handleApiErrorEducationModule(
      'Failed to render content blocks',
      'renderBlocks',
      '',
       '',
      (error as any)?.message || 'Unknown error',
      500,
      this.device
    );
  }

  return html;
}


  parseChildren(children: any[]): string {
  try {
    return children
      .map(child => {
        if (child.type === 'link' && child.url) {
          const linkText = this.parseChildren(child.children || []);
          return `<a href="${child.url}" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
        }

        let text = child.text || '';

        if (child.bold) {
          text = `<strong>${text}</strong>`;
        }
        if (child.underline) {
          text = `<u>${text}</u>`;
        }

        return text;
      })
      .join('');
  } catch (error) {
    console.error('Error parsing children:', error);

    this.loggingService.handleApiErrorEducationModule(
      'Failed to parse content block children',
      'parseChildren(legalrights)',
      '',
      '',
      (error as any)?.message || 'Unknown error',
      500,
      this.device
    );

    return ''; // Fallback to empty string on error
  }
}


  
  

}
