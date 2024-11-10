import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateTripUserDto } from './dto/create-trip-user.dto';
import { TripUser, TripUserStatus, UserRole } from './entities/trip-user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { TripService } from '../trip/trip.service';
import { ListTripResponseDto } from '../trip/dto/list-trip.dto';
import { Trip } from '../trip/entities/trip.entity';
import { TripCoordinate } from '../trip-coordinate/entities/trip-coordinate.entity';
import { TripCoordinateService } from '../trip-coordinate/trip-coordinate.service';
import { CreateTripWithOtherCoordinates } from './dto/create-trip-user-with-other-coordinates.dto';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class TripUserService {
  private transporter;
  constructor(
    @InjectRepository(TripUser)
    private readonly tripUserRepository: Repository<TripUser>,
    private readonly userService: UserService,
    @Inject(forwardRef(() => TripService))
    private readonly tripService: TripService,
    private readonly dataSource: DataSource,
    private readonly tripCoordinateService: TripCoordinateService,
    private configService: ConfigService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<string>('SMTP_PORT'),
      secure: this.configService.get<string>('SMTP_SECURE') === 'true',
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  async registrationTripUser(createTripUserDto: CreateTripUserDto, tripDetails?: Trip, manager?: EntityManager) {
    const queryRunner = manager ? null : this.dataSource.createQueryRunner();

    if (queryRunner) {
      await queryRunner.startTransaction();
    }
    const { userId, tripId, role } = createTripUserDto;
    const existingEnrollment = await this.tripUserRepository.findOne({
      where: { user: { id: userId }, trip: { id: tripId } },
    });
    let trip = tripDetails;

    if (existingEnrollment) {
      throw new BadRequestException(
        'El usuario ya esta inscripto en este viaje',
      );
    }
    const user = await this.userService.findOneById(userId);
    if (!user) {
      throw new NotFoundException('El usuario no existe en la plataforma');
    }

    if (!trip) { //User registering to an existing trip
      trip = await this.tripService.findTripEntityById(tripId);
    }

    try {
      const tripUser = this.tripUserRepository.create({
        user: user,
        trip: trip,
        joinDate: new Date(),
        status: TripUserStatus.Confirmed,
        role: role ?? UserRole.PASSENGER,
      });

      // Use the provided manager or the queryRunner's manager to save
      if (manager) {
        await manager.save(tripUser);
      } else {
        await queryRunner.manager.save(tripUser);
      }

      if (tripUser.role === UserRole.PASSENGER) {
        // Get the driver's start coordinate
        const driverCoordinate = await this.tripCoordinateService.getStartCoordinateByTripId(trip.id);

        if (driverCoordinate) {
          const passengerCoordinate = new TripCoordinate();
          passengerCoordinate.latitude = driverCoordinate.latitude;  // Use driver's start latitude
          passengerCoordinate.longitude = driverCoordinate.longitude;  // Use driver's start longitude
          passengerCoordinate.isStart = false; // Passenger's point, not start
          passengerCoordinate.isEnd = false;
          passengerCoordinate.tripUser = tripUser;

          // Save the passenger coordinate
          if (manager) {
            await manager.save(passengerCoordinate);
          } else {
            await queryRunner.manager.save(passengerCoordinate);
          }
        }
      }

      if (!manager) {
        await queryRunner.commitTransaction(); // Commit only if using queryRunner
      }

      return tripUser;

    } catch (error) {
      if (queryRunner) {
        await queryRunner.rollbackTransaction(); // Rollback only if using queryRunner
      }
      throw new InternalServerErrorException(error);
    } finally {
      if (queryRunner) {
        await queryRunner.release(); // Release only if using queryRunner
      }
    }
  }

  async registerPassengerWithOtherCoordinates(createPassengerDto: CreateTripWithOtherCoordinates) {

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();
    const { userId, tripId, latitude, longitude } = createPassengerDto;
    try {

      const existingEnrollment = await this.tripUserRepository.findOne({
        where: {
          user: { id: userId },
          trip: { id: tripId },
          status: In([TripUserStatus.Confirmed, TripUserStatus.Pending]),
        },
      });
      if (existingEnrollment) {
        throw new BadRequestException('El usuario ya está inscripto en este viaje');
      }


      const user = await this.userService.findOneById(userId);
      if (!user) {
        throw new NotFoundException('El usuario no existe en la plataforma');
      }


      const trip = await this.tripService.findTripEntityById(tripId);
      if (!trip) {
        throw new NotFoundException('El viaje no existe en la plataforma');
      }

      const conflictingEnrollment = await this.tripUserRepository.findOne({
        where: {
          user: { id: userId },
          trip: { startDate: trip.startDate },
          status: In([TripUserStatus.Confirmed, TripUserStatus.Pending])
        },
      });
      if (conflictingEnrollment) {
        throw new BadRequestException(
          'El usuario ya está inscripto en otro viaje en la misma fecha'
        );
      }


      const tripUser = this.tripUserRepository.create({
        user: user,
        trip: trip,
        joinDate: new Date(),
        status: TripUserStatus.Pending,
        role: UserRole.PASSENGER,
      });

      await queryRunner.manager.save(tripUser);


      const passengerCoordinate = new TripCoordinate();
      passengerCoordinate.latitude = latitude;
      passengerCoordinate.longitude = longitude;
      passengerCoordinate.isStart = false;
      passengerCoordinate.isEnd = false;
      passengerCoordinate.tripUser = tripUser;

      await queryRunner.manager.save(passengerCoordinate);

      await queryRunner.commitTransaction();
      return tripUser;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof BadRequestException || error instanceof NotFoundException) {

        throw error;
      }


      throw new InternalServerErrorException(error.message);
    } finally {
      await queryRunner.release();
    }
  }




  async findTripsByUser(userId: string, role: UserRole): Promise<ListTripResponseDto[]> {
    const trips = await this.tripUserRepository
      .createQueryBuilder('tripUser')
      .leftJoinAndSelect('tripUser.trip', 'trip')
      .leftJoinAndSelect('trip.tripUsers', 'tripUsers')
      .where('tripUser.user.id = :userId', { userId })
      .andWhere('tripUser.role = :role', { role })
      .select([
        'tripUser.joinDate',
        'tripUser.status',
        'trip.id',
        'trip.origin',
        'trip.destination',
        'trip.startDate',
        'trip.description',
        'trip.estimatedCost',
        'tripUsers.id',
        'trip.maxPassengers',
      ])
      .getMany();
    const ret = trips.map((tu) => {
      const tripDto = new ListTripResponseDto();
      tripDto.id = tu.trip.id;
      tripDto.origin = tu.trip.origin;
      tripDto.destination = tu.trip.destination;
      tripDto.startDate = tu.trip.startDate;
      tripDto.description = tu.trip.description;
      tripDto.estimatedCost = tu.trip.estimatedCost;
      tripDto.maxPassengers = tu.trip.maxPassengers;
      tripDto.registrants = tu.trip.tripUsers
        ? tu.trip.tripUsers.reduce((count) => count + 1, 0)
        : 0;
      return tripDto;
    });

    return ret;
  }


  async getRequestDetails(tripUserId: string, tripId: string) {
    // Obtener el tripUser principal con estado pendiente
    const tripUser = await this.tripUserRepository
      .createQueryBuilder('tripUser')
      .innerJoinAndSelect('tripUser.user', 'user')
      .leftJoinAndSelect('tripUser.tripCoordinates', 'tripCoordinate')
      .where('tripUser.id = :tripUserId', { tripUserId })
      .andWhere('tripUser.status = :pendingStatus', { pendingStatus: TripUserStatus.Pending })
      .getOne();

    if (!tripUser) {
      throw new BadRequestException('Pending passenger not found or not in pending status.');
    }

    const trip = await this.tripUserRepository
      .createQueryBuilder('tripUser')
      .innerJoinAndSelect('tripUser.trip', 'trip')
      .where('tripUser.trip.id = :tripId', { tripId })
      .getOne();

    if (!trip) {
      throw new BadRequestException('Trip not found.');
    }

    // Resolver las tripCoordinates del tripUser principal
    const coordinates = await tripUser.tripCoordinates;

    // Obtener los tripUsers confirmados asociados al tripId 
    const confirmedTripUsers = await this.tripUserRepository
      .createQueryBuilder('tripUser')
      .innerJoinAndSelect('tripUser.user', 'user')
      .leftJoinAndSelect('tripUser.tripCoordinates', 'tripCoordinate')
      .where('tripUser.trip.id = :tripId', { tripId })
      .andWhere('tripUser.status = :confirmedStatus', { confirmedStatus: TripUserStatus.Confirmed })
      .getMany();

    // Obtener las coordenadas de los tripUsers confirmados utilizando la lógica de mapeo
    const coordinatesConfirmed = await Promise.all(
      confirmedTripUsers.map(async (confirmedTripUser) => {
        const confirmedCoordinates = await confirmedTripUser.tripCoordinates;
        return confirmedCoordinates.map((coordinate) => ({
          latitude: coordinate.latitude,
          longitude: coordinate.longitude,
          isStart: coordinate.isStart,
          isEnd: coordinate.isEnd,
        }));
      }),
    );

    return {
      tripUserId: tripUser.id,
      name: tripUser.user.name,
      surname: tripUser.user.surname,
      email: tripUser.user.email,
      isUserVerified: tripUser.user.isUserVerified,
      origin: trip.trip.origin,
      destination: trip.trip.destination,
      startDate: trip.trip.startDate,
      coordinates: coordinates.map((coordinate) => ({
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        isStart: coordinate.isStart,
        isEnd: coordinate.isEnd,
      })),
      coordinatesConfirmed: coordinatesConfirmed.flat(),
      contact: tripUser.user.phoneNumber
    };
  }

  async rejectRequest(tripUserId: string, rejectionReason: string) {

    const tripUser = await this.tripUserRepository.findOne({
      where: { id: tripUserId },
      relations: ['trip', 'user'],
    });

    if (!tripUser) {
      throw new NotFoundException('Solicitud de pasajero no encontrada');
    }

    if (tripUser.status !== TripUserStatus.Pending) {
      throw new BadRequestException('La solicitud no está en estado pendiente');
    }

    const trip = tripUser.trip;

    tripUser.status = TripUserStatus.Rejected;
    await this.tripUserRepository.save(tripUser);


    await this.sendEmail(
      tripUser.user.email,
      tripUser.user.name,
      'rechazada',
      trip.origin,
      trip.destination,
      rejectionReason
    );
    return {
      message: 'La solicitud ha sido rechazada.',
      status: tripUser.status,
    };
  }

  async acceptRequest(tripUserId: string) {

    const tripUser = await this.tripUserRepository.findOne({
      where: { id: tripUserId },
      relations: ['trip', 'user'],
    });

    if (!tripUser) {
      throw new NotFoundException('Solicitud de pasajero no encontrada');
    }

    if (tripUser.status !== TripUserStatus.Pending) {
      throw new BadRequestException('La solicitud no está en estado pendiente');
    }

    const trip = tripUser.trip;


    const confirmedPassengersCount = await this.tripUserRepository.count({
      where: {
        trip: { id: trip.id },
        status: TripUserStatus.Confirmed,
      },
    });

    if ((confirmedPassengersCount - 1) >= trip.maxPassengers) {

      tripUser.status = TripUserStatus.Rejected;
      await this.tripUserRepository.save(tripUser);


      await this.sendEmail(
        tripUser.user.email,
        tripUser.user.name,
        'rechazada',
        trip.origin,
        trip.destination
      );
    } else {

      tripUser.status = TripUserStatus.Confirmed;
      await this.tripUserRepository.save(tripUser);


      await this.sendEmail(
        tripUser.user.email,
        tripUser.user.name,
        'aprobada',
        trip.origin,
        trip.destination
      );
    }

    return {
      message:
        tripUser.status === TripUserStatus.Confirmed
          ? 'La solicitud ha sido aprobada.'
          : 'La solicitud ha sido rechazada por falta de espacio.',
      status: tripUser.status,
    };
  }

  private async sendEmail(
    email: string,
    name: string,
    status: string,
    origin: string,
    destination: string,
    rejectionReason?: string
  ) {
    const subject = status === 'aprobada' ? 'Solicitud Aprobada' : 'Solicitud Rechazada';


    const text =
      status === 'aprobada'
        ? `Hola ${name},\n\nTu solicitud para unirte al viaje con origen ${origin} hacia destino ${destination} ha sido aprobada. ¡Nos vemos en el viaje!`
        : `Hola ${name},\n\nLamentablemente, tu solicitud para unirte al viaje con origen ${origin} hacia el destino ${destination} ha sido rechazada.` +
        (rejectionReason ? ` Motivo: ${rejectionReason}` : '');

    const html =
      status === 'aprobada'
        ? `<p>Hola ${name},</p><p>Tu solicitud para unirte al viaje con origen <strong>${origin}</strong> hacia destino <strong>${destination}</strong> ha sido aprobada. ¡Nos vemos en el viaje!</p>`
        : `Hola ${name},\n\nLamentablemente, tu solicitud para unirte al viaje con origen ${origin} hacia el destino ${destination} ha sido rechazada.` +
        (rejectionReason ? ` Motivo: ${rejectionReason}` : '');

    const mailOptions = {
      from: '"TripBook" <tripbook14@gmail.com>',
      to: email,
      subject,
      text,
      html,
    };

    await this.transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error al enviar el correo:', error);
      } else {
        console.log('Correo enviado:', info.response);
      }
    });
  }
}
