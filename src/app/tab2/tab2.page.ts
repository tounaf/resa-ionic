import { Component, OnInit } from '@angular/core';
import { DataService, Field } from '../services/data.service'; // Import Reservation and Field
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

export interface Reservation {
  id: string;
  userId: string;
  fieldId: string;
  slotTime: string;
  paymentType: 'advance' | 'full';
  paymentMethod: 'Mvola' | 'OrangeMoney';
  selectedOptions: string[];
  status: string;
  date: string;
}

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule
  ]
})
export class Tab2Page implements OnInit {
  reservations: (Reservation & { field: Field; isPast: boolean })[] = [];
  filteredReservations: (Reservation & { field: Field; isPast: boolean })[] = [];
  filter: 'ongoing' | 'past' = 'ongoing';

  constructor(private dataService: DataService, private router: Router) {}

  async ngOnInit() {
    await this.loadReservations();
  }

  async loadReservations() {
    const user = await this.dataService.getCurrentUser();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }
    this.reservations = await this.dataService.getUserReservations(user.id);
    this.filteredReservations = this.reservations.filter(r => this.filter === 'ongoing' ? !r.isPast : r.isPast);
  }
}