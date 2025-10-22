import { Component } from '@angular/core';
import { DataService } from '../services/data.service';
import { Router } from '@angular/router';
import { AlertController, IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: 'login.page.html',
  styleUrls: ['login.page.scss'],
  imports: [
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule
  ]
})
export class LoginPage {
  username = '';
  password = '';

  constructor(private dataService: DataService, private router: Router, private alertCtrl: AlertController) {}

  async login() {
    const user = await this.dataService.login(this.username, this.password);
    if (user) {
      if (user.isAdmin) {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/']);
      }
    } else {
      const alert = await this.alertCtrl.create({ message: 'Identifiants incorrects' });
      alert.present();
    }
  }
}