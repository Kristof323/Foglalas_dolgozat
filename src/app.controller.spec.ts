import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller.js';
import { AppService, MYSQL_POOL } from './app.service.js';

describe('AppController', () => {
  let appController: AppController;
  const execute = vi.fn().mockResolvedValue([{ affectedRows: 1 }, []]);
  const query = vi.fn().mockResolvedValue([[{ count: 2 }], []]);

  beforeEach(async () => {
    execute.mockClear();
    query.mockClear();
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: MYSQL_POOL,
          useValue: { execute, query },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('renders the booking page with the current booking count', async () => {
      await expect(appController.getHello()).resolves.toEqual({
        title: 'Foglalás',
        message: null,
        errorMessage: null,
        bookingCount: 2,
      });
    });

    it('saves a booking before returning the success message', async () => {
      const response = { status: vi.fn() };
      await expect(
        appController.createBooking({
          name: 'csapo kris',
          email: 'teszt@example.hu',
          startDate: '2099-12-31T12:30',
          guests: '2',
        }, response),
      ).resolves.toEqual({
        title: 'Foglalás',
        message: 'Sikeres foglalás',
        errorMessage: null,
        bookingCount: 2,
      });
      expect(execute).toHaveBeenNthCalledWith(
        1,
        'INSERT INTO reservations (name, email, startDate, guests) VALUES (?, ?, ?, ?)',
        ['csapo kris', 'teszt@example.hu', '2099-12-31 12:30:00', 2],
      );
      expect(query).toHaveBeenCalledWith(
        'SELECT COUNT(*) AS count FROM reservations',
      );
    });

    it('ne mentese hibás e-mail cím esetén', async () => {
      const response = { status: vi.fn() };
      await expect(
        appController.createBooking({
          name: 'Teszt Elek',
          email: 'hibas-email',
          startDate: '2099-12-31T12:30',
          guests: '2',
        }, response),
      ).resolves.toEqual({
        title: 'Foglalás',
        message: null,
        errorMessage: 'Érvénytelen e-mail cím.',
        bookingCount: 2,
      });
      expect(response.status).toHaveBeenCalledWith(400);
      expect(execute).not.toHaveBeenCalled();
    });
  });
});
