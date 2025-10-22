import { Component, OnInit } from '@angular/core';
import { DataService } from '../services/data.service';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  imports: [
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    RouterModule
  ]
})
export class AdminPage implements OnInit {
  reservations: any[] = [];
  users: any[] = [];
  analytics: any = {};
  newOption = '';
  newZone = '';

  constructor(private dataService: DataService) {}

  async ngOnInit() {
    this.loadData();
  }

  async loadData() {
    this.reservations = await this.dataService.getAllReservations();
    this.users = (await this.dataService.getAllUsers()).filter(u => !u.isAdmin);
    this.analytics = await this.dataService.getAnalytics();
  }

  async approve(id: string) {
    await this.dataService.approveReservation(id);
    this.loadData();
  }

  async reject(id: string) {
    await this.dataService.rejectReservation(id);
    this.loadData();
  }

  async addOption() {
    if (this.newOption) {
      await this.dataService.addOption(this.newOption);
      this.newOption = '';
    }
  }

  async addZone() {
    if (this.newZone) {
      await this.dataService.addZone(this.newZone);
      this.newZone = '';
    }
  }
}