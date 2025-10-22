import { Component } from '@angular/core';
import { DataService } from '../services/data.service';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  imports: [
    IonicModule
  ]
})
export class Tab3Page {
  constructor(private dataService: DataService, private router: Router) {}

  async logout() {
    await this.dataService.logout();
    this.router.navigate(['/login']);
  }
}