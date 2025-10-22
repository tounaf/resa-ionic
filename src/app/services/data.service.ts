import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { v4 as uuidv4 } from 'uuid';
import * as Luxon from 'luxon';

// Define User interface
interface User {
  id: string;
  username: string;
  password: string;
  isAdmin: boolean;
}

interface Reservation {
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

export interface Field {
  id: string;
  name: string;
  type: string;
  zone: string;
  availableSlots: { time: string; available: boolean }[];
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private _storage: Storage | null = null;

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    const storage = await this.storage.create();
    this._storage = storage;
    await this.seedMockData();
  }

  async seedMockData() {
    if (!(await this._storage?.get('users'))) {
      await this._storage?.set('users', [
        { id: uuidv4(), username: 'admin', password: 'admin', isAdmin: true },
        { id: uuidv4(), username: 'user1', password: '123', isAdmin: false }
      ]);
    }
    if (!(await this._storage?.get('fields'))) {
      await this._storage?.set('fields', [
        { id: uuidv4(), name: 'Field 1', type: 'Foot 7', zone: 'Analakely', availableSlots: this.generateSlots() },
        { id: uuidv4(), name: 'Field 2', type: 'Foot 12', zone: 'Antsirabe', availableSlots: this.generateSlots() }
      ]);
    }
    if (!(await this._storage?.get('options'))) {
      await this._storage?.set('options', ['Vestiaire', 'Parking', 'Sécurité', 'Enceinte enfant', 'Ballon', 'Maillot']);
    }
    if (!(await this._storage?.get('zones'))) {
      await this._storage?.set('zones', ['Analakely', 'Antsirabe']);
    }
    if (!(await this._storage?.get('reservations'))) {
      await this._storage?.set('reservations', []);
    }
  }

  generateSlots() {
    const slots: { time: string; available: boolean }[] = [];
    const start = Luxon.DateTime.now().startOf('day');
    for (let i = 0; i < 48; i++) {
      slots.push({ time: start.plus({ minutes: i * 30 }).toISO(), available: true });
    }
    return slots;
  }

  // User methods
  async register(username: string, password: string): Promise<string> {
    const users: User[] = (await this._storage?.get('users')) || [];
    const id = uuidv4();
    users.push({ id, username, password, isAdmin: false });
    await this._storage?.set('users', users);
    return id;
  }

  async login(username: string, password: string): Promise<User | null> {
    const users: User[] = (await this._storage?.get('users')) || [];
    const user = users.find((u: User) => u.username === username && u.password === password);
    if (user) {
      await this._storage?.set('currentUser', user);
      return user;
    }
    return null;
  }

  async getCurrentUser(): Promise<User | null> {
    return await this._storage?.get('currentUser');
  }

  async logout(): Promise<void> {
    await this._storage?.remove('currentUser');
  }

  async getAllUsers(): Promise<User[]> {
    return (await this._storage?.get('users')) || [];
  }

  // Fields and Reservations
  async getFields(zone?: string): Promise<Field[]> {
    let fields: Field[] = (await this._storage?.get('fields')) || [];
    if (zone) fields = fields.filter((f: Field) => f.zone === zone);
    return fields;
  }

  async getOptions(): Promise<string[]> {
    return (await this._storage?.get('options')) || [];
  }

  async addOption(option: string): Promise<void> {
    const options = await this.getOptions();
    options.push(option);
    await this._storage?.set('options', options);
  }

  async getZones(): Promise<string[]> {
    return (await this._storage?.get('zones')) || [];
  }

  async addZone(zone: string): Promise<void> {
    const zones = await this.getZones();
    zones.push(zone);
    await this._storage?.set('zones', zones);
  }

  async makeReservation(
    fieldId: string,
    slotTime: string,
    paymentType: 'advance' | 'full',
    paymentMethod: 'Mvola' | 'OrangeMoney',
    selectedOptions: string[]
  ): Promise<Reservation | undefined> {
    const user = await this.getCurrentUser();
    if (!user) return undefined; // Explicitly return undefined
    const fields: Field[] = await this.getFields();
    const field = fields.find((f: Field) => f.id === fieldId);
    if (field) {
      const slot = field.availableSlots.find((s: { time: string; available: boolean }) => s.time === slotTime);
      if (slot && slot.available) {
        slot.available = false;
        await this._storage?.set('fields', fields);
        const reservations: Reservation[] = (await this._storage?.get('reservations')) || [];
        const res: Reservation = {
          id: uuidv4(),
          userId: user.id,
          fieldId,
          slotTime,
          paymentType,
          paymentMethod,
          selectedOptions,
          status: 'pending',
          date: Luxon.DateTime.now().toISO()
        };
        reservations.push(res);
        await this._storage?.set('reservations', reservations);
        return res; // Returns Reservation
      }
    }
    return undefined; // Explicitly return undefined for cases where field or slot is not found
  }

  async getUserReservations(userId: string): Promise<(Reservation & { field: Field; isPast: boolean })[]> {
    const reservations: Reservation[] = (await this._storage?.get('reservations')) || [];
    const fields: Field[] = await this.getFields();
    return reservations
      .filter((r: Reservation) => r.userId === userId)
      .map((r: Reservation) => ({
        ...r,
        field: fields.find((f: Field) => f.id === r.fieldId)!,
        isPast: Luxon.DateTime.fromISO(r.slotTime) < Luxon.DateTime.now()
      }));
  }

  async getAllReservations(): Promise<(Reservation & { field: Field; user: User })[]> {
    const reservations: Reservation[] = (await this._storage?.get('reservations')) || [];
    const fields: Field[] = await this.getFields();
    const users: User[] = await this.getAllUsers();
    return reservations.map((r: Reservation) => ({
      ...r,
      field: fields.find((f: Field) => f.id === r.fieldId)!,
      user: users.find((u: User) => u.id === r.userId)!
    }));
  }

  async approveReservation(resId: string): Promise<void> {
    const reservations: Reservation[] = (await this._storage?.get('reservations')) || [];
    const res = reservations.find((r: Reservation) => r.id === resId);
    if (res) res.status = 'approved';
    await this._storage?.set('reservations', reservations);
  }

  async rejectReservation(resId: string): Promise<void> {
    const reservations: Reservation[] = (await this._storage?.get('reservations')) || [];
    const res = reservations.find((r: Reservation) => r.id === resId);
    if (res) res.status = 'rejected';
    await this._storage?.set('reservations', reservations);
  }

  async getAnalytics(): Promise<{ totalReservations: number; pending: number; approved: number }> {
    const reservations: Reservation[] = await this.getAllReservations();
    return {
      totalReservations: reservations.length,
      pending: reservations.filter((r: Reservation) => r.status === 'pending').length,
      approved: reservations.filter((r: Reservation) => r.status === 'approved').length
    };
  }
}
