import { Component } from '@angular/core';
import { DataService } from '../services/data.service';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: 'login.page.html',
  styleUrls: ['login.page.scss'],
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