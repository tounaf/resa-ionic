import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../services/data.service';
import { AlertController, IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reservation',
  templateUrl: './reservation.page.html',
  styleUrls: ['./reservation.page.scss'],
  imports: [
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule
  ]
})
export class ReservationPage implements OnInit {
  fieldId: string;
  field: any;
  options: string[] = [];
  selectedOptions: any = {};
  slotTime = '';
  paymentType: 'advance' | 'full' = 'advance';
  paymentMethod: 'Mvola' | 'OrangeMoney' = 'Mvola';

  constructor(private route: ActivatedRoute, private dataService: DataService, private router: Router, private alertCtrl: AlertController) {
    this.fieldId = this.route.snapshot.paramMap.get('fieldId')!;
  }

  async ngOnInit() {
    const fields = await this.dataService.getFields();
    this.field = fields.find(f => f.id === this.fieldId);
    this.options = await this.dataService.getOptions();
    this.options.forEach(opt => this.selectedOptions[opt] = false);
  }

  async reserve() {
    const selectedOpts = Object.keys(this.selectedOptions).filter(opt => this.selectedOptions[opt]);
    await this.dataService.makeReservation(this.fieldId, this.slotTime, this.paymentType, this.paymentMethod, selectedOpts);
    const alert = await this.alertCtrl.create({ message: 'Réservation effectuée !' });
    alert.present();
    this.router.navigate(['/tab2']);
  }
}