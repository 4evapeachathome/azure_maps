# Peace at Home

## Project Overview  
Peace at Home is an Ionic Angular application designed for managing home-related activities. It ensures a responsive user experience across web, iOS, and Android platforms.

---

## Features  
- **Lazy Loading**: Enhances performance by loading modules on demand.  
- **Responsive Design**: Seamless experience on web, iOS, and Android devices.  
- **Collapsible Navigation Menu**: Improves navigation usability.  
- **Common API Service**: Streamlines HTTP requests.  
- **Modular Architecture**: Easy scalability and component additions.  

---

## Getting Started  

### Prerequisites  
Before starting, ensure you have the following installed:  
- **Node.js (v12 or higher)**: [Download Node.js](https://nodejs.org/)  
- **Ionic CLI**: Install globally using:  
  ```bash
  npm install -g @ionic/cli


### Angular CLI: Install globally using:
npm install -g @angular/cli

### Installation
git clone https://dev.azure.com/nsf-pfi/4EVA/_git/4EVA
cd 4EVA

### Install dependencies:

npm install

### Configuration

Navigate to the src/environments directory.

Update the environment.ts file with your API base URL and other necessary configurations.

### Running the Application
In Browser:

ionic serve

On iOS: Ensure X is installed, then run:

ionic capacitor open ios

On Android: Ensure Android Studio is installed, then run:

ionic capacitor open android

### Building for Production
To build the app for production, run:

ionic build --prod

### Running Unit Tests
To run unit tests, run:

ng test

### Running End-to-End Tests
To run end-to-end tests, run:

ng e2e

### Deployment
To deploy the app, run:

ionic deploy

### Troubleshooting
If you encounter any issues, refer to the [Ionic documentation](https://ionicframework.com/docs/troubleshooting) or [Angular documentation](https://angular.io/guide/troubleshooting).


### Adding New Pages and Services
To add new pages or services, follow the [Angular documentation](https://angular.io/guide/dependency-injection).

Creating a New Page

1. Create a new page in the src/app/pages directory.
2. Add the new page to the app.module.ts file.

ionic generate page pages/YourNewPageName

Creating a New Service

1. Create a new service in the src/app/services directory.
2. Add the new service to the app.module.ts file.

ionic generate service services/YourNewServiceName


Implement the service logic:

import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class YourNewServiceName {
  constructor(private apiService: ApiService) {}

  getData() {
    return this.apiService.get('your-endpoint');
  }
}

### Using the Service in a Page

Inject the service into your page:

import { YourNewServiceName } from '../services/your-new-service-name.service';

export class YourNewPageName implements OnInit {
  data: any;

  constructor(private yourNewService: YourNewServiceName) {}

  ngOnInit() {
    this.yourNewService.getData().subscribe(response => {
      this.data = response;
    });
  }
}

Display the data in the HTML template:

<ion-content>
  <div *ngIf="data">
    <pre>{{ data | json }}</pre>
  </div>
</ion-content>

Contributing
Fork the repository.

Create a new branch for your feature or bug fix.

Commit your changes and push to your fork.

Open a pull request.



To ensure lazy loading is properly configured when adding a new component or service in your Ionic Angular application, follow these steps for each type:

For a New Component
Generate the New Component: Use the Ionic CLI to generate a new component:


ionic generate component controls/YourNewComponentName
Create a Module for the Component: Lazy loading requires a module. If your new component doesn't already have a module, create one:


ionic generate module controls/YourNewComponentName
Update the Module: Open the newly created module file (e.g., your-new-component-name.module.ts) and declare your new component in it:


import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { YourNewComponentName } from './your-new-component-name.component';

@NgModule({
  declarations: [YourNewComponentName],
  imports: [CommonModule],
  exports: [YourNewComponentName] // Export if needed in other modules
})
export class YourNewComponentNameModule { }
Update Routing: If you want to lazy load the component, you need to set up routing. Create a routing module (if not already created) for the component:


import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { YourNewComponentName } from './your-new-component-name.component';

const routes: Routes = [
  {
    path: '',
    component: YourNewComponentName
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class YourNewComponentNameRoutingModule { }
Update the Main Routing Module: In your main routing module (usually app-routing.module.ts), add a route for the new component module:


const routes: Routes = [
  {
    path: 'your-new-component',
    loadChildren: () => import('./controls/your-new-component-name/your-new-component-name.module').then(m => m.YourNewComponentNameModule)
  },
  // other routes...
];
For a New Service
Generate the New Service: Use the Ionic CLI to create a new service:


ionic generate service services/YourNewServiceName
Implement the Service Logic: Open the generated service file (e.g., your-new-service-name.service.ts) and implement the desired methods. For example, create methods to make API calls using the common API service:


import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root' // This makes the service available application-wide
})
export class YourNewServiceName {
  constructor(private apiService: ApiService) {}

  getData() {
    return this.apiService.get('your-endpoint');
  }
}
Using the Service: Inject the service into the component or page where you want to use it. For example, in a page component:


import { Component, OnInit } from '@angular/core';
import { YourNewServiceName } from '../services/your-new-service-name.service';

@Component({
  selector: 'app-your-new-page-name',
  templateUrl: './your-new-page-name.page.html',
  styleUrls: ['./your-new-page-name.page.scss'],
})
export class YourNewPageName implements OnInit {
  data: any;

  constructor(private yourNewService: YourNewServiceName) {}

  ngOnInit() {
    this.yourNewService.getData().subscribe(response => {
      this.data = response;
    });
  }
}
Summary
For a New Component: Generate the component, create a module for it, configure routing for lazy loading, and update the main routing module.
For a New Service: Generate the service, implement the logic, and inject it into components or pages where needed.



