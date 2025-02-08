import { Component, AfterViewInit  } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-us-map',
  templateUrl: './us-map.component.html',
  styleUrls: ['./us-map.component.scss'],
  standalone: true,
  imports: [CommonModule,  IonicModule],
})
export class UsMapComponent implements AfterViewInit {
  constructor(private router: Router) {}

  // Called after the view is initialized (after SVG is loaded)
  ngAfterViewInit() {
    this.loadSVGMap();
  }

  // Load the SVG map and attach event listeners
  loadSVGMap() {
    const svgObject = document.getElementById('us-map-object') as HTMLObjectElement;

    // Wait for the SVG document to be loaded
    svgObject.onload = () => {
      const svgDoc = svgObject.contentDocument; // Get the SVG document inside the object

      if (!svgDoc) {
        console.error('Failed to load SVG document.');
        return;
      }

      // // Get all states (which are 'path' elements in the SVG)
      // const states = svgDoc.querySelectorAll('g');

      // // Attach event listeners to each state
      // states.forEach((state: any) => {
      //   const stateId = state.id; // Read the state's ID (e.g., 'California')
      //   const stateName = state.querySelector('text tspan')?.textContent; // Read the state name from the title tag

      //   // Attach mouseover, mouseout, and click events
      //   state.addEventListener('mouseover', () => this.onStateHover(stateName));
      //   state.addEventListener('mouseout', () => this.onStateMouseOut(stateId));
      //   state.addEventListener('click', () => this.onStateClick(stateName));
      // });

      // Attach event listeners to each state
      
        //const stateNames = states[0].querySelectorAll('text tspan'); // Read the state names from the svg
        const stateNames = svgDoc.querySelectorAll('g text tspan');

        stateNames.forEach(stateName => {
          //const stateId = stateName.closest('g')?.id; // Get the corresponding <g> element's ID (the state group)
          const stateId = stateName.id; 
        
          const stateText = stateName.textContent || ''; // Get the state name from the text content of tspan

      // Attach mouseover, mouseout, and click events
      stateName.addEventListener('mouseover', () => this.onStateHover(stateId, stateText));
      stateName.addEventListener('mouseout', () => this.onStateMouseOut(stateText));
      stateName.addEventListener('click', () => this.onStateClick(stateText));

        // // Attach mouseover, mouseout, and click events
        // stateName.addEventListener('mouseover', () => this.onStateHover(stateName.textContent || ''));
        // stateName.addEventListener('mouseout', () => this.onStateMouseOut(stateName.textContent || ''));
        // stateName.addEventListener('click', () => this.onStateClick(stateName.textContent || ''));
      });

    };
  }

  // parseSvg(svgContent: string): string[] {
  //   const parser = new DOMParser();
  //   const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
  //   const textElements = svgDoc.querySelectorAll('text tspan');
  //   const stateNames: string[] = [];

  //   textElements.forEach(element => {
  //     stateNames.push(element.textContent || '');
  //   });

  //   return stateNames;
  // }

  // Handle mouse hover event to change the color of the state
  onStateHover(stateId: string | undefined, stateText: string | undefined) {
    const svgObject = document.getElementById('us-map-object') as HTMLObjectElement;
    const svgDoc = svgObject.contentDocument;
    const stateNames = svgDoc?.querySelectorAll('g text tspan');
    stateNames?.forEach(stateName => {
      if (stateName.textContent === stateText) {
        stateName.setAttribute('fill', 'red'); // Change color on hover
        (stateName as HTMLElement).style.cursor = 'pointer'; // Change cursor to pointer
        //(stateName as HTMLElement).style.backgroundColor = 'red';
        
      } else {
        stateName.setAttribute('fill', 'black'); // Reset to default color
      }
    });
  }

  // Handle mouse out event to reset the color of the state
  onStateMouseOut(state: string) {
    const stateElement = document.getElementById(state);
    if (stateElement) {
      stateElement.setAttribute('fill', 'black'); // Reset to default color
    }
  }

  // Redirect to state details component when a state is clicked
  onStateClick(stateName: string) {
    this.router.navigate(['/us-state-law-details', stateName ]);
  }
}
