import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import usaMap from '@svg-maps/usa';

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
  title: string;
  description: string;
  lastUpdated: string;
  source: string;
}

@Component({
  selector: 'app-usa-map',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './usa-map.component.html',
  styleUrls: ['./usa-map.component.scss']
})
export class UsaMapComponent {
  usaMap = usaMap;
  selectedState: { id: string; name: string; path?: string } | null = null;
  showLawInfo = false;

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

  // Mock state law data - replace with actual API call in production
  private stateLaws: { [key: string]: StateLaw } = {
    california: {
      title: 'California Privacy Rights Act (CPRA)',
      description: 'The California Privacy Rights Act (CPRA) enhances consumer privacy rights and builds upon the California Consumer Privacy Act (CCPA). Key provisions include:\n\n' +
        '• Right to correct inaccurate personal information\n' +
        '• Right to limit use and disclosure of sensitive personal information\n' +
        '• Extended data retention limitations\n' +
        '• Enhanced consent requirements for minors\n' +
        '• Creation of the California Privacy Protection Agency',
      lastUpdated: '2023-01-01',
      source: 'California State Legislature'
    },
    // Add more states as needed
  };

  onStateClick(state: { id: string; name: string; path: string }) {
    this.selectedState = { ...state };
    this.showLawInfo = true;
    console.log('Selected state:', state.name);
  }

  resetState() {
    this.selectedState = null;
    this.showLawInfo = false;
  }

  getStateAbbreviation(stateId: string): string {
    return this.stateAbbreviations[stateId] || stateId;
  }

  getSelectedStatePath(): string {
    const location = this.usaMap.locations.find(loc => loc.id === this.selectedState?.id);
    return location?.path || '';
  }

  getStateLaw(): StateLaw {
    if (!this.selectedState) {
      return {
        title: '',
        description: '',
        lastUpdated: '',
        source: ''
      };
    }

    return this.stateLaws[this.selectedState.id] || {
      title: `${this.selectedState.name} Privacy Laws`,
      description: 'Information about specific privacy laws for this state is currently being compiled.',
      lastUpdated: 'N/A',
      source: 'Pending'
    };
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