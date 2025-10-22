import { Component, OnInit } from '@angular/core';
import { DataService } from '../services/data.service'; // Import Field interface
import { Router } from '@angular/router';

interface Field {
  id: string;
  name: string;
  type: string;
  zone: string;
  availableSlots: { time: string; available: boolean }[];
}

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {
  fields: Field[] = []; // Use Field interface instead of any
  zones: string[] = [];
  selectedZone = '';

  constructor(private dataService: DataService, private router: Router) {}

  async ngOnInit() {
    const user = await this.dataService.getCurrentUser();
    if (!user) this.router.navigate(['/login']);
    this.zones = await this.dataService.getZones();
    this.selectedZone = this.zones[0] || ''; // Handle empty zones
    this.loadFields();
  }

  async loadFields() {
    this.fields = await this.dataService.getFields(this.selectedZone);
  }

  getAvailableSlots(field: Field): { time: string; available: boolean }[] {
    return field.availableSlots
      .filter((s: { time: string; available: boolean }) => s.available) // Explicitly type s
      .slice(0, 5); // Show first 5
  }
}