import { Injectable } from '@nestjs/common';
import mysql from 'mysql2/promise';

const mysqlConnection = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'db',
});

@Injectable()
export class AppService {
  async getDarabszam() {
    const [sorok]: any = await mysqlConnection.execute(
      'SELECT COUNT(*) AS db FROM reservations',
    );
    return sorok[0].db;
  }

  async ujFoglalas(name: string, email: string, startDate: Date, guests: number) {
    await mysqlConnection.execute(
      'INSERT INTO reservations (name, email, startDate, guests) VALUES (?, ?, ?, ?)',
      [name, email, startDate, guests],
    );
  }
}