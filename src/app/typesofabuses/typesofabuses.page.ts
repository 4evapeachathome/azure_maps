import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { APIEndpoints } from 'src/shared/endpoints';

@Component({
  selector: 'app-typesofabuses',
  templateUrl: './typesofabuses.page.html',
  styleUrls: ['./typesofabuses.page.scss'],
  standalone: false
})
export class TypesofabusesPage implements OnInit {
  activeSection: string = '';
  ipvtypesofabusesendpoint:string=APIEndpoints.ipvtypesofabuses;
  physicalabuse:string=APIEndpoints.physicalabuse;
  sexualabuse:string=APIEndpoints.sexualabuse;
  emotionalabuse:string=APIEndpoints.emotionalabuse;
  verbalabuse:string=APIEndpoints.verbalabuse;
  financialabuse:string=APIEndpoints.financialabuse;
  technologicalabuse:string=APIEndpoints.technologicalabuse;
  immigrantabuse:string=APIEndpoints.immigrantabuse;
  systemabuse:string=APIEndpoints.systemabuse;

  @ViewChild('abuseSections', { static: false }) abuseSections!: ElementRef;

  constructor() { }

  ngOnInit() {
  }

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
  }


