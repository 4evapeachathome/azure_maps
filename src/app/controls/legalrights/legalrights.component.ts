import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { BreadcrumbComponent } from "../breadcrumb/breadcrumb.component";

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
  @Input() endpoint:string = '';
  constructor(private apiService:ApiService,private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.getLegalRightsData(this.endpoint);
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
            const hasWebImage = !!block.webImage; // Check if webImage is not null
            const blockData = {
              content: this.sanitizer.bypassSecurityTrustHtml(this.renderBlocks(block.content || [])),
              image: block.image || '',
              webImage: block.webImage,
              validWebImageIndex: hasWebImage ? validImageCount++ : -1 // Increment only for valid webImage
            };
            return blockData;
          });
        }
      },
      (error) => {
        console.error('Error fetching legal rights data:', error);
      }
    );
  }


  renderBlocks(blocks: any[]): string {
    let html = '';
    let i = 0;

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

    return html;
  }

  parseChildren(children: any[]): string {
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
  }

  
  

}
