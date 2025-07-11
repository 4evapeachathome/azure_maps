// import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { IonicModule, Platform } from '@ionic/angular';
// import usaMap from '@svg-maps/usa';
// import { ApiService } from '../services/api.service';
// import { BreadcrumbComponent } from "../controls/breadcrumb/breadcrumb.component";
// import { FormsModule } from '@angular/forms';

// interface Point {
//   x: number;
//   y: number;
// }

// interface BoundingBox {
//   minX: number;
//   minY: number;
//   maxX: number;
//   maxY: number;
// }


// interface StateLaw {
//   state: string;
//   lawdescription: string;
//   link: string;
// }

// @Component({
//   selector: 'pathome-usa-map',
//   standalone: true,
//   imports: [CommonModule, IonicModule, BreadcrumbComponent,FormsModule],
//   templateUrl: './usa-map.component.html',
//   styleUrls: ['./usa-map.component.scss']
// })
// export class UsaMapComponent {
//   @Output() stateSelected = new EventEmitter<{ id: string; name: string; path: string }>();
//   usaMap = usaMap;
//   @Input() selectedState: { id: string; name: string; path?: string } | null = null;
//   showLawInfo = false;
//   stateLaws: StateLaw[] = [];
//   isMobile: boolean = false; // Flag to check if the device is mobile
//   stateOptions: { name: string, code: string }[] = [];

//   constructor(private apiService: ApiService, private platform: Platform) { 
//     this.isMobile = this.platform.is('android') || this.platform.is('ios');
//     this.stateOptions = Object.entries(this.stateAbbreviations).map(([key, value]) => {
//       return {
//         name: this.capitalizeWords(key.replace(/-/g, ' ')),
//         code: value
//       };
//     });
//     this.getUSLawsbystateData();
//   }

//   clearSelectedState() {
//     this.selectedState = null;
//     this.showLawInfo = false; // Hide the state view when breadcrumb is clicked
//   }

//   get filteredStates() {
//    
//     return this.usaMap?.locations?.filter(state => 
//       !['Washington, DC'].includes(state.name)
//     ) || [];
//   }

//   private capitalizeWords(str: string): string {
//     return str.replace(/\b\w/g, char => char.toUpperCase());
//   }

//   private stateAbbreviations: { [key: string]: string } = {
//     alabama: 'AL', alaska: 'AK', arizona: 'AZ', arkansas: 'AR', california: 'CA',
//     colorado: 'CO', connecticut: 'CT', delaware: 'DE', florida: 'FL', georgia: 'GA',
//     hawaii: 'HI', idaho: 'ID', illinois: 'IL', indiana: 'IN', iowa: 'IA',
//     kansas: 'KS', kentucky: 'KY', louisiana: 'LA', maine: 'ME', maryland: 'MD',
//     massachusetts: 'MA', michigan: 'MI', minnesota: 'MN', mississippi: 'MS', missouri: 'MO',
//     montana: 'MT', nebraska: 'NE', nevada: 'NV', 'new-hampshire': 'NH', 'new-jersey': 'NJ',
//     'new-mexico': 'NM', 'new-york': 'NY', 'north-carolina': 'NC', 'north-dakota': 'ND', ohio: 'OH',
//     oklahoma: 'OK', oregon: 'OR', pennsylvania: 'PA', 'rhode-island': 'RI', 'south-carolina': 'SC',
//     'south-dakota': 'SD', tennessee: 'TN', texas: 'TX', utah: 'UT', vermont: 'VT',
//     virginia: 'VA', washington: 'WA', 'west-virginia': 'WV', wisconsin: 'WI', wyoming: 'WY'
// };

// getStateAbbreviation(stateId: string): string {
//   if (!stateId) return '';
//   return this.stateAbbreviations[stateId.toLowerCase()] || stateId.toUpperCase();
// }

// private lineLabelStates: string[] = ['ri', 'hi'];

// needsLineLabel(stateId?: string): boolean {
//   if (!stateId) return false;
//   return this.lineLabelStates.includes(stateId.toLowerCase());
// }

// onStateSelected() {
//   this.showLawInfo = true;
// }

// getLineCoordinates(pathData: string, stateId: string): { start: Point; end: Point } {
//   const center = this.getStateCenter(pathData, stateId);
//   const bbox = this.calculateBoundingBox(pathData);

//   let endX = bbox.maxX + 20;
//   let endY = center.y;

//   if (stateId.toLowerCase() === 'ri') {
//     endX = bbox.maxX + 30;
//     endY = center.y + 40;
//   } else if (stateId.toLowerCase() === 'hi') {
//     endX = bbox.minX + 60; // Extend left for HI
//     endY = center.y + 30;
//   }

//   return {
//     start: { x: bbox.maxX, y: center.y },
//     end: { x: endX, y: endY },
//   };
// }

//   openlink() {
//     const law = this.getStateLaw();
//     if (law?.link) {
//       window.open(law.link, '_blank');
//     }
//   }

//   private smallStrokeStates: string[] = ['hi','vt', 'md', 'ct', 'nh', 'ma', 'ri', 'nj', 'de'];

// isSmallState(stateId?: string): boolean {
//   if (!stateId) return false;
//   return this.smallStrokeStates.includes(stateId.toLowerCase());
// }

// private largeStrokeStates: string[] = ['ak', 'ca', 'tx'];


// isLargeState(stateId?: string): boolean {
//   if (!stateId) return false;
//   return this.largeStrokeStates.includes(stateId.toLowerCase());
// }
  
  
//  getUSLawsbystateData() {
//     this.apiService.getStateLaws().subscribe(
//       (response: StateLaw[]) => {
//        
//         this.stateLaws = response;
//       },
//       (error) => {
//         console.error('Error fetching state laws:', error);
//       }
//     );
//   }

//   onStateClick(state: { id: string; name: string; path: string }) {
//     const match = this.usaMap.locations.find(loc => loc.id === state.id);
//     if (match) {
//       this.selectedState = match;
//       this.stateSelected.emit(match);
//       this.showLawInfo = true;
//     }
//   }

//   resetState() {
//     this.selectedState = null;
//     this.showLawInfo = false;
//     this.clearSelectedState();
//   }


//   getSelectedStatePath(): string {
//     const location = this.usaMap.locations.find(loc => loc.id.toLowerCase() === this.selectedState?.id?.toLowerCase());
//     return location?.path || '';
//   }

//   getStateLaw(): StateLaw | null {
//     if (!this.selectedState) return null;
    
//     // Find law for selected state (case insensitive match)
//     const stateLaw = this.stateLaws.find(law => 
//       law.state.toLowerCase() === this.selectedState?.name.toLowerCase()
//     );

//     return stateLaw || null;
//   }

//   getLawDescription(): string {
//     
//     const law = this.getStateLaw();
//     if (!law || !law.lawdescription) return '';
  
//     // Ensure lawdescription is an array
//     if (Array.isArray(law.lawdescription)) {
//       return law.lawdescription
//         .map((paragraph: any) =>
//           paragraph.children?.map((child: any) => child.text).join(' ') || ''
//         )
//         .join('\n'); // Join paragraphs with a newline
//     }
  
//     return ''; // Return empty string if not in expected format
//   }
  

//   getStateViewBox(): string {
//     if (!this.selectedState) return '0 0 100 100';
//     const bbox = this.calculateBoundingBox(this.getSelectedStatePath());
    
//     // Calculate the center of the bounding box
//     const centerX = (bbox.minX + bbox.maxX) / 2;
//     const centerY = (bbox.minY + bbox.maxY) / 2;
    
//     // Calculate the current width and height
//     const width = bbox.maxX - bbox.minX;
//     const height = bbox.maxY - bbox.minY;
    
//     // Use the larger dimension to maintain aspect ratio
//     const size = Math.max(width, height);
    
//     // Add padding (20% of size)
//     const padding = size * 0.2;
//     const totalSize = size + (padding * 2);
    
//     // Calculate new coordinates to center the state
//     const newMinX = centerX - (totalSize / 2);
//     const newMinY = centerY - (totalSize / 2);
    
//     return `${newMinX} ${newMinY} ${totalSize} ${totalSize}`;
//   }


//   private stateTextOffsets: { [key: string]: { x: number; y: number } } = {
//     'wa': { x: 10, y: 20 },      // Washington - Move down to middle
//     'id': { x: 0, y: 10 },      // Idaho - Move slightly south
//     'mn': { x: -15, y: 10 },      // Minnesota - Move south from north edge
//     'wi': { x: 0, y: 10 },      // Wisconsin - Move south from Michigan border // Texas - Move northwest from southeast
//     'ak': { x: 30, y: -90 },    // Alaska - Move northeast from southwest
//     'la': { x: -27, y: -15 },   // Louisiana - Move northwest from southeast to center
//     'va': { x: 0, y: 10 },    // Virginia - Move southwest from northeast
//     'md': { x: 0, y: 0 },     // Maryland - Move left from Delaware overlap
//     'nc': { x: 0, y: 0 },     // North Carolina - Move left to center    // Mississippi - Move left from Alabama overlap
//     'ma': { x: -10, y: 2 },     // Massachusetts - Move left
//     'ri': { x: 0, y: 5 },      // Rhode Island - Move slightly left
//     'ga': { x: -10, y: -10 },   // Georgia - Move northwest to middle
//     'fl': { x: 15, y: 0 } ,
//     'mi': { x: 10, y: 40 } ,   
//     'nj': { x: 3, y: 0 }  ,
//     'ky': { x: 10, y: 5 }  ,
//     'de': { x: 3, y: 5 }  ,
//     'in': { x: 0, y: -15 }  ,
//     'hi': { x: 8, y: 35 }  ,
//     'mt': { x: 15, y: 0 }  ,
//     'az': { x: 15, y: 0 }  ,
//     'ct': { x: 0, y: 3 }  ,
//     'ms': { x: 5, y: 0 }  ,
//   };

//   getStateCenter(pathData: string, stateId?: string): Point {
//    
//     const coordinates = this.extractCoordinates(pathData);
//     if (coordinates.length === 0) return { x: 0, y: 0 };

//     const sum = coordinates.reduce((acc, curr) => ({
//       x: acc.x + curr.x,
//       y: acc.y + curr.y
//     }));

//     const center = {
//       x: sum.x / coordinates.length,
//       y: sum.y / coordinates.length
//     };

//     // Apply custom offset if state ID exists in our offset table
//     if (stateId && this.stateTextOffsets[stateId.toLowerCase()]) {
//       const offset = this.stateTextOffsets[stateId.toLowerCase()];
//       return {
//         x: center.x + offset.x,
//         y: center.y + offset.y
//       };
//     }

//     return center;
//   }

//   private calculateBoundingBox(pathData: string): BoundingBox {
//     const coordinates = this.extractCoordinates(pathData);
//     if (coordinates.length === 0) {
//       return { minX: 0, minY: 0, maxX: 100, maxY: 100 };
//     }

//     return coordinates.reduce((bbox, point) => ({
//       minX: Math.min(bbox.minX, point.x),
//       minY: Math.min(bbox.minY, point.y),
//       maxX: Math.max(bbox.maxX, point.x),
//       maxY: Math.max(bbox.maxY, point.y)
//     }), {
//       minX: coordinates[0].x,
//       minY: coordinates[0].y,
//       maxX: coordinates[0].x,
//       maxY: coordinates[0].y
//     });
//   }

//   private extractCoordinates(pathData: string): Point[] {
//     const coordinates: Point[] = [];
//     const commands = pathData.match(/[A-Za-z][^A-Za-z]*/g) || [];
    
//     let currentX = 0;
//     let currentY = 0;
  
//     commands.forEach(cmd => {
//       const type = cmd[0];
//       const args = cmd.slice(1).trim().split(/[\s,]+/).map(Number);
  
//       if (type === 'M') { // Absolute move to
//         currentX = args[0];
//         currentY = args[1];
//         coordinates.push({ x: currentX, y: currentY });
//       } else if (type === 'm') { // Relative move to
//         currentX += args[0];
//         currentY += args[1];
//         coordinates.push({ x: currentX, y: currentY });
//       } else if (type === 'L') { // Absolute line to
//         currentX = args[0];
//         currentY = args[1];
//         coordinates.push({ x: currentX, y: currentY });
//       } else if (type === 'l') { // Relative line to
//         currentX += args[0];
//         currentY += args[1];
//         coordinates.push({ x: currentX, y: currentY });
//       }
//     });
  
//     return coordinates;
//   }





// }

import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, Platform } from '@ionic/angular';
import usaMap from '@svg-maps/usa';
import { ApiService } from '../services/api.service';
import { BreadcrumbComponent } from "../controls/breadcrumb/breadcrumb.component";
import { FormsModule } from '@angular/forms';
import { LoggingService } from '../services/logging.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { APIEndpoints } from 'src/shared/endpoints';

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
  imports: [CommonModule, IonicModule, BreadcrumbComponent, FormsModule],
  templateUrl: './usa-map.component.html',
  styleUrls: ['./usa-map.component.scss']
})
export class UsaMapComponent {
  @Output() stateSelected = new EventEmitter<{ id: string; name: string; path: string }>();
  usaMap = usaMap;
  device:any;
  @Input() selectedState: { id: string; name: string; path?: string } | null = null;
  showLawInfo = false;
  stateLaws: StateLaw[] = [];
  isMobile: boolean = false;

  constructor(private apiService: ApiService,
    private loggingService: LoggingService,
    private deviceService: DeviceDetectorService,
     private platform: Platform) 
     { 
    this.device = this.deviceService.getDeviceInfo();
    this.isMobile = this.platform.is('android') || this.platform.is('ios');
    this.getUSLawsbystateData();
  }

  clearSelectedState() {
    this.selectedState = null;
    this.showLawInfo = false;
  }

  get filteredStates() {
    return this.usaMap?.locations?.filter(state => 
      !['Washington, DC'].includes(state.name)
    ) || [];
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
    if (!stateId) return '';
    return this.stateAbbreviations[stateId.toLowerCase()] || stateId.toUpperCase();
  }

  getStateTitle(stateName: string): string | null {
    if (!stateName) return null;
    // Normalize state name to match stateAbbreviations keys (lowercase, hyphenated)
    const normalizedName = stateName
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z-]/g, ''); // Remove any special characters
    return this.stateAbbreviations[normalizedName] || null;
  }

  private lineLabelStates: string[] = ['ri', 'hi'];

  needsLineLabel(stateId?: string): boolean {
    if (!stateId) return false;
    return this.lineLabelStates.includes(stateId.toLowerCase());
  }

  getLineCoordinates(pathData: string, stateId: string): { start: Point; end: Point } {
    const center = this.getStateCenter(pathData, stateId);
    let endX = center.x + 20;
    let endY = center.y;
  
    // Customize for specific states
    if (stateId.toLowerCase() === 'ri') {
      // Reduce line length for Rhode Island
      const dx = 45;
      const dy = 45;
      const factor = 0.5; // 50% of the original offset
  
      endX = center.x + dx * factor;
      endY = center.y + dy * factor;
    } else if (stateId.toLowerCase() === 'hi') {
      endX = center.x + 60;
      endY = center.y + 20;
    }
  
    return {
      start: { x: center.x, y: center.y },
      end: { x: endX, y: endY },
    };
  }

  openlink() {
    const law = this.getStateLaw();
    if (law?.link) {
      window.open(law.link, '_blank');
    }
  }

  private smallStrokeStates: string[] = ['hi', 'vt', 'md', 'ct', 'nh', 'ma', 'ri', 'nj', 'de'];

  isSmallState(stateId?: string): boolean {
    if (!stateId) return false;
    return this.smallStrokeStates.includes(stateId.toLowerCase());
  }

  private largeStrokeStates: string[] = ['ak', 'ca', 'tx'];

  isLargeState(stateId?: string): boolean {
    if (!stateId) return false;
    return this.largeStrokeStates.includes(stateId.toLowerCase());
  }
  
 getUSLawsbystateData() {
  this.apiService.getStateLaws().subscribe(
    (response: StateLaw[]) => {
      this.stateLaws = response;
    },
    (error) => {
      console.error('Error fetching state laws:', error);
      this.loggingService.handleApiErrorEducationModule(
        'Failed to load US state laws',
        'getUSLawsbystateData',
        APIEndpoints.usstatelaws || '', // Replace with your actual constant if available
        '',
        error?.error?.error?.message || error?.message || 'Unknown error',
        error?.status || 500,
        this.device
      );
    }
  );
}


  onStateClick(state: { id: string; name: string }) {
    const match = this.usaMap.locations.find(loc => loc.id === state.id);
    if (match) {
      this.selectedState = { ...match }; // Create a copy to avoid mutating usaMap data
      this.stateSelected.emit(match);
      this.showLawInfo = true;
    }
  }

  getLabelOffset(stateId: string): { x: number; y: number } {
    if (stateId.toLowerCase() === 'ri') {
      return { x: 6, y: 4 }; // move label slightly right and down
    } else if (stateId.toLowerCase() === 'hi') {
      return { x: 8, y: 4 };
    }
    return { x: 0, y: 0 };
  }

  resetState() {
    this.selectedState = null;
    this.showLawInfo = false;
    this.clearSelectedState();
  }

  getSelectedStatePath(): string {
    const location = this.usaMap.locations.find(loc => loc.id.toLowerCase() === this.selectedState?.id?.toLowerCase());
    return location?.path || '';
  }

  getStateLaw(): StateLaw | null {
    if (!this.selectedState) return null;
    
    const stateLaw = this.stateLaws.find(law => 
      law.state.toLowerCase() === this.selectedState?.name.toLowerCase()
    );

    return stateLaw || null;
  }

  getLawDescription(): string {
    const law = this.getStateLaw();
    if (!law || !law.lawdescription) return '';
  
    if (Array.isArray(law.lawdescription)) {
      return law.lawdescription
        .map((paragraph: any) =>
          paragraph.children?.map((child: any) => child.text).join(' ') || ''
        )
        .join('\n');
    }
  
    return '';
  }

  getStateViewBox(): string {
    if (!this.selectedState) return '0 0 100 100';
    const bbox = this.calculateBoundingBox(this.getSelectedStatePath());
    
    const centerX = (bbox.minX + bbox.maxX) / 2;
    const centerY = (bbox.minY + bbox.maxY) / 2;
    
    const width = bbox.maxX - bbox.minX;
    const height = bbox.maxY - bbox.minY;
    
    const size = Math.max(width, height);
    
    const padding = size * 0.2;
    const totalSize = size + (padding * 2);
    
    const newMinX = centerX - (totalSize / 2);
    const newMinY = centerY - (totalSize / 2);
    
    return `${newMinX} ${newMinY} ${totalSize} ${totalSize}`;
  }

  private stateTextOffsets: { [key: string]: { x: number; y: number } } = {
    'wa': { x: 10, y: 20 },
    'id': { x: 0, y: 10 },
    'mn': { x: -15, y: 10 },
    'wi': { x: 0, y: 10 },
    'ak': { x: 30, y: -90 },
    'la': { x: -27, y: -15 },
    'va': { x: 0, y: 10 },
    'md': { x: 0, y: 0 },
    'nc': { x: 0, y: 0 },
    'ma': { x: -10, y: 2 },
    'ri': { x: 0, y: 5 },
    'ga': { x: -10, y: -10 },
    'fl': { x: 15, y: 0 },
    'mi': { x: 10, y: 40 },
    'nj': { x: 3, y: 0 },
    'ky': { x: 10, y: 5 },
    'de': { x: 3, y: 5 },
    'in': { x: 0, y: -15 },
    'hi': { x: 8, y: 35 },
    'mt': { x: 15, y: 0 },
    'az': { x: 15, y: 0 },
    'ct': { x: 0, y: 3 },
    'ms': { x: 5, y: 0 },
  };

  getStateCenter(pathData: string, stateId?: string): Point {
    const coordinates = this.extractCoordinates(pathData);
    if (coordinates.length === 0) return { x: 0, y: 0 };

    const sum = coordinates.reduce((acc, curr) => ({
      x: acc.x + curr.x,
      y: acc.y + curr.y
    }));

    const center = {
      x: sum.x / coordinates.length,
      y: sum.y / coordinates.length
    };

    if (stateId && this.stateTextOffsets[stateId.toLowerCase()]) {
      const offset = this.stateTextOffsets[stateId.toLowerCase()];
      return {
        x: center.x + offset.x,
        y: center.y + offset.y
      };
    }

    return center;
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
  
      if (type === 'M') {
        currentX = args[0];
        currentY = args[1];
        coordinates.push({ x: currentX, y: currentY });
      } else if (type === 'm') {
        currentX += args[0];
        currentY += args[1];
        coordinates.push({ x: currentX, y: currentY });
      } else if (type === 'L') {
        currentX = args[0];
        currentY = args[1];
        coordinates.push({ x: currentX, y: currentY });
      } else if (type === 'l') {
        currentX += args[0];
        currentY += args[1];
        coordinates.push({ x: currentX, y: currentY });
      }
    });
  
    return coordinates;
  }
}