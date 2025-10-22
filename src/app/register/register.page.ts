import { Component } from '@angular/core';
import { DataService } from '../services/data.service';
import { Router } from '@angular/router';
import { AlertController, IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: 'register.page.html',
  styleUrls: ['login.page.scss'],
  imports: [
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule
  ]
})
export class RegisterPage {
  username = '';
  password = '';

  constructor(private dataService: DataService, private router: Router, private alertCtrl: AlertController) {}

// Similar to login, but:
    async register() {
    const id = await this.dataService.register(this.username, this.password);
    if (id) {
        await this.dataService.login(this.username, this.password);
        this.router.navigate(['/']);
    }
    }
}