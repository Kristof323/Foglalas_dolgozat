import { Body, Controller, Get, Post, Render } from '@nestjs/common';
import { AppService } from './app.service.js';
import { FoglalasDto } from './foglalas.dto.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('index')
  async urlap() {
    return {
      darab: await this.appService.getDarabszam(),
      hibak: [],
      siker: false,
      adat: { name: '', email: '', startDate: '', guests: '' },
    };
  }

  @Post()
  @Render('index')
  async foglalas(@Body() adat: FoglalasDto) {
    const hibak: string[] = [];

    if (!adat.name || adat.name.trim() === '') {
      hibak.push('A név megadása kötelező!');
    }

    if (!/^[^@\s]+@[^@\s]+$/.test(adat.email)) {
      hibak.push('Az e-mail cím nem megfelelő! (pl. abc@def.hu)');
    }

    const datum = new Date(adat.startDate);
    if (!adat.startDate || isNaN(datum.getTime())) {
      hibak.push('A dátum megadása kötelező!');
    } else if (datum < new Date()) {
      hibak.push('A dátum nem lehet régebbi a mostaninál!');
    }

    const vendegek = Number(adat.guests);
    if (!Number.isInteger(vendegek) || vendegek < 1 || vendegek > 10) {
      hibak.push('A vendégek száma 1 és 10 között legyen!');
    }

    if (hibak.length > 0) {
      return {
        darab: await this.appService.getDarabszam(),
        hibak: hibak,
        siker: false,
        adat: adat,
      };
    }

    await this.appService.ujFoglalas(adat.name.trim(), adat.email, datum, vendegek);

    return {
      darab: await this.appService.getDarabszam(),
      hibak: [],
      siker: true,
      adat: { name: '', email: '', startDate: '', guests: '' },
    };
  }
}