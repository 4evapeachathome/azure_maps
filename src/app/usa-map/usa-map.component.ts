import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import usaMap from '@svg-maps/usa';
import { ApiService } from '../services/api.service';
import { BreadcrumbComponent } from "../controls/breadcrumb/breadcrumb.component";

interface Point {
  x: number;
  y: number;
}

interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}


interface StateLaw {
  state: string;
  lawdescription: string;
  link: string;
}

@Component({
  selector: 'pathome-usa-map',
  standalone: true,
  imports: [CommonModule, IonicModule, BreadcrumbComponent],
  templateUrl: './usa-map.component.html',
  styleUrls: ['./usa-map.component.scss']
})
export class UsaMapComponent {
  @Output() stateSelected = new EventEmitter<{ id: string; name: string; path: string }>();
  usaMap = usaMap;
  @Input() selectedState: { id: string; name: string; path?: string } | null = null;
  showLawInfo = false;
  stateLaws: StateLaw[] = [];


  constructor(private apiService: ApiService) {
    this.getUSLawsbystateData();

  }

  clearSelectedState() {
    this.selectedState = null;
    this.showLawInfo = false; // Hide the state view when breadcrumb is clicked
  }

  private stateAbbreviations: { [key: string]: string } = {
    alabama: 'AL', alaska: 'AK', arizona: 'AZ', arkansas: 'AR', california: 'CA',
    colorado: 'CO', connecticut: 'CT', delaware: 'DE', florida: 'FL', georgia: 'GA',
    hawaii: 'HI', idaho: 'ID', illinois: 'IL', indiana: 'IN', iowa: 'IA',
    kansas: 'KS', kentucky: 'KY', louisiana: 'LA', maine: 'ME', maryland: 'MD',
    massachusetts: 'MA', michigan: 'MI', minnesota: 'MN', mississippi: 'MS', missouri: 'MO',
    montana: 'MT', nebraska: 'NE', nevada: 'NV', 'new-hampshire': 'NH', 'new-jersey': 'NJ',
    'new-mexico': 'NM', 'new-york': 'NY', 'north-carolina': 'NC', 'north-dakota': 'ND', ohio: 'OH',
    oklahoma: 'OK', oregon: 'OR', pennsylvania: 'PA', 'rhode-island': 'RI', 'south-carolina': 'SC',
    'south-dakota': 'SD', tennessee: 'TN', texas: 'TX', utah: 'UT', vermont: 'VT',
    virginia: 'VA', washington: 'WA', 'west-virginia': 'WV', wisconsin: 'WI', wyoming: 'WY'
};

getStateAbbreviation(stateId: string): string {
  return this.stateAbbreviations[stateId] || stateId;
}

  openlink() {
    const law = this.getStateLaw();
    if (law?.link) {
      window.open(law.link, '_blank');
    }
  }

  
 getUSLawsbystateData() {
    this.apiService.getStateLaws().subscribe(
      (response: StateLaw[]) => {
       // debugger;
        this.stateLaws = response;
      },
      (error) => {
        console.error('Error fetching state laws:', error);
      }
    );
  }

  onStateClick(state: { id: string; name: string; path: string }) {
    this.selectedState = { ...state };
    this.stateSelected.emit(state);
    this.showLawInfo = true;
    console.log('Selected state:', state.name);
  }

  resetState() {
    this.selectedState = null;
    this.showLawInfo = false;
    this.clearSelectedState();
  }


  getSelectedStatePath(): string {
    const location = this.usaMap.locations.find(loc => loc.id === this.selectedState?.id);
    return location?.path || '';
  }

  getStateLaw(): StateLaw | null {
    if (!this.selectedState) return null;
    
    // Find law for selected state (case insensitive match)
    const stateLaw = this.stateLaws.find(law => 
      law.state.toLowerCase() === this.selectedState?.name.toLowerCase()
    );

    return stateLaw || null;
  }

  getLawDescription(): string {
    //debugger;
    const law = this.getStateLaw();
    if (!law || !law.lawdescription) return '';
  
    // Ensure lawdescription is an array
    if (Array.isArray(law.lawdescription)) {
      return law.lawdescription
        .map((paragraph: any) =>
          paragraph.children?.map((child: any) => child.text).join(' ') || ''
        )
        .join('\n'); // Join paragraphs with a newline
    }
  
    return ''; // Return empty string if not in expected format
  }
  

  getStateViewBox(): string {
    if (!this.selectedState) return '0 0 100 100';
    const bbox = this.calculateBoundingBox(this.getSelectedStatePath());
    
    // Calculate the center of the bounding box
    const centerX = (bbox.minX + bbox.maxX) / 2;
    const centerY = (bbox.minY + bbox.maxY) / 2;
    
    // Calculate the current width and height
    const width = bbox.maxX - bbox.minX;
    const height = bbox.maxY - bbox.minY;
    
    // Use the larger dimension to maintain aspect ratio
    const size = Math.max(width, height);
    
    // Add padding (20% of size)
    const padding = size * 0.2;
    const totalSize = size + (padding * 2);
    
    // Calculate new coordinates to center the state
    const newMinX = centerX - (totalSize / 2);
    const newMinY = centerY - (totalSize / 2);
    
    return `${newMinX} ${newMinY} ${totalSize} ${totalSize}`;
  }


  getStateCenter(pathData: string): Point {
    const coordinates = this.extractCoordinates(pathData);
    if (coordinates.length === 0) return { x: 0, y: 0 };

    const sum = coordinates.reduce((acc, curr) => ({
      x: acc.x + curr.x,
      y: acc.y + curr.y
    }));

    return {
      x: sum.x / coordinates.length,
      y: sum.y / coordinates.length
    };
  }

  private calculateBoundingBox(pathData: string): BoundingBox {
    const coordinates = this.extractCoordinates(pathData);
    if (coordinates.length === 0) {
      return { minX: 0, minY: 0, maxX: 100, maxY: 100 };
    }

    return coordinates.reduce((bbox, point) => ({
      minX: Math.min(bbox.minX, point.x),
      minY: Math.min(bbox.minY, point.y),
      maxX: Math.max(bbox.maxX, point.x),
      maxY: Math.max(bbox.maxY, point.y)
    }), {
      minX: coordinates[0].x,
      minY: coordinates[0].y,
      maxX: coordinates[0].x,
      maxY: coordinates[0].y
    });
  }

  private extractCoordinates(pathData: string): Point[] {
    const coordinates: Point[] = [];
    const commands = pathData.match(/[A-Za-z][^A-Za-z]*/g) || [];
    
    let currentX = 0;
    let currentY = 0;

    commands.forEach(cmd => {
      const type = cmd[0];
      const args = cmd.slice(1).trim().split(/[\s,]+/).map(Number);

      if (type === 'M' || type === 'L') {
        currentX = args[0];
        currentY = args[1];
        coordinates.push({ x: currentX, y: currentY });
      }
    });

    return coordinates;
  }





}