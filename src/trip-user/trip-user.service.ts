import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateTripUserDto } from './dto/create-trip-user.dto';
import {
  TripUser,
  TripUserStatus,
  UserRole,
} from './entities/trip-user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, QueryRunner, Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { TripService } from '../trip/trip.service';
import { ListTripResponseDto } from '../trip/dto/list-trip.dto';
import { Trip } from '../trip/entities/trip.entity';
import { TripCoordinate } from '../trip-coordinate/entities/trip-coordinate.entity';
import { TripCoordinateService } from '../trip-coordinate/trip-coordinate.service';
import { CreateTripWithOtherCoordinates } from './dto/create-trip-user-with-other-coordinates.dto';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { FilterTripsDto } from './dto/filters-trip-user.dto';

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

  async registrationTripUser(
    createTripUserDto: CreateTripUserDto,
    tripDetails?: Trip,
    queryRunner?: QueryRunner,
  ) {
    const { userId } = createTripUserDto;
    const trip = tripDetails;

    const user = await this.userService.findOneById(userId);
    if (!user) {
      throw new NotFoundException('El usuario no existe en la plataforma');
    }
    const conflictingEnrollment = await this.tripUserRepository.findOne({
      where: {
        user: { id: userId },
        trip: { startDate: trip.startDate },
        status: In([TripUserStatus.Confirmed, TripUserStatus.Pending]),
      },
    });
    if (conflictingEnrollment) {
      throw new BadRequestException(
        'El usuario ya está inscripto en otro viaje en la misma fecha',
      );
    }
    try {
      const tripUser = this.tripUserRepository.create({
        user: user,
        trip: trip,
        joinDate: new Date(),
        status: TripUserStatus.Confirmed,
        role: UserRole.DRIVER,
      });

      await queryRunner.manager.save(tripUser);

      return tripUser;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error
    }
  }

  async registerPassengerWithOtherCoordinates(
    createPassengerDto: CreateTripWithOtherCoordinates,
  ) {
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
        throw new BadRequestException(
          'El usuario ya está inscripto en este viaje',
        );
      }

      const user = await this.userService.findOneById(userId);
      if (!user) {
        throw new NotFoundException('El usuario no existe en la plataforma');
      }

      const trip = await this.tripService.findTripEntityById(tripId);
      if (!trip) {
        throw new NotFoundException('El viaje no existe en la plataforma');
      }

      const currentPassengersCount = await this.tripUserRepository.count({
        where: { trip: { id: tripId } },
      });
      if ((currentPassengersCount - 1) >= trip.maxPassengers) {
        throw new BadRequestException(
          'El viaje ha alcanzado su límite máximo de pasajeros',
        );
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
          'El usuario ya está inscripto en otro viaje en la misma fecha',
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
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findTripsByUser(
    userId: string,
    role: UserRole,
    filters: FilterTripsDto
  ): Promise<ListTripResponseDto[]> {
    const queryBuilder = this.tripUserRepository.createQueryBuilder('tripUser')
      .leftJoinAndSelect('tripUser.trip', 'trip')
      .leftJoinAndSelect('trip.tripUsers', 'tripUsers')
      .where('tripUser.user.id = :userId', { userId })
      .andWhere('tripUser.role = :role', { role });


    if (filters.origin) {
      queryBuilder.andWhere('trip.origin LIKE :origin', { origin: `%${filters.origin}%` });
    }
    if (filters.destination) {
      queryBuilder.andWhere('trip.destination LIKE :destination', { destination: `%${filters.destination}%` });
    }
    if (filters.startDate) {
      queryBuilder.andWhere('DATE(trip.startDate) = :startDate', { startDate: filters.startDate });
    }
    if (filters.status) {
      queryBuilder.andWhere('tripUser.status = :status', { status: filters.status });
    }

    const trips = await queryBuilder
      .select([
        'tripUser.id',
        'tripUser.joinDate',
        'tripUser.status',
        'trip.id',
        'trip.origin',
        'trip.destination',
        'trip.startDate',
        'trip.description',
        'trip.estimatedCost',
        'trip.imageUrl',
        'tripUsers.id',
        'trip.maxPassengers',
        'tripUsers.status'
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
      tripDto.status = tu.status;
      tripDto.tripUserId = tu.id;
      tripDto.imageUrl = tu.trip.imageUrl;
      // Filtrar usuarios con estado 'confirmed'
      const confirmedUsers = tu.trip.tripUsers.filter((user) => user.status === 'confirmed');

      // Calcular registrants excluyendo al conductor
      tripDto.registrants = confirmedUsers.length ? confirmedUsers.length - 1 : 0;
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
      .andWhere('tripUser.status = :pendingStatus', {
        pendingStatus: TripUserStatus.Pending,
      })
      .getOne();

    if (!tripUser) {
      throw new BadRequestException(
        'Pending passenger not found or not in pending status.',
      );
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
      .andWhere('tripUser.status = :confirmedStatus', {
        confirmedStatus: TripUserStatus.Confirmed,
      })
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
      requesterCoordinates: coordinates.map((coordinate) => ({
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        isStart: coordinate.isStart,
        isEnd: coordinate.isEnd,
      })).flat(),
      tripCoordinates: coordinatesConfirmed.flat(),
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
      'rejected',
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
        'rejected',
        trip.origin,
        trip.destination
      );
    } else {

      tripUser.status = TripUserStatus.Confirmed;
      await this.tripUserRepository.save(tripUser);


      await this.sendEmail(
        tripUser.user.email,
        tripUser.user.name,
        'approved',
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

  async cancelRequest(tripUserId: string) {

    const tripUser = await this.tripUserRepository.findOne({
      where: { id: tripUserId },
      relations: ['trip', 'user'],
    });

    if (!tripUser) {
      throw new NotFoundException('Inscripción no encontrada');
    }

    if (tripUser.role === UserRole.DRIVER) {
      throw new BadRequestException('Los conductores no pueden cancelar el viaje');
    }

    if (tripUser.status !== TripUserStatus.Confirmed) {
      throw new BadRequestException('Solo se pueden cancelar inscripciones confirmadas');
    }


    tripUser.status = TripUserStatus.Cancelled;
    await this.tripUserRepository.save(tripUser);


    await this.sendEmail(
      tripUser.user.email,
      tripUser.user.name,
      'cancelled',
      tripUser.trip.origin,
      tripUser.trip.destination
    );

    return {
      message: 'La inscripción ha sido cancelada.',
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
    const statusMessages = {
      approved: {
        subject: 'Solicitud Aprobada',
        text: `Hola ${name},\n\nTu solicitud para unirte al viaje con origen ${origin} hacia destino ${destination} ha sido aprobada. ¡Nos vemos en el viaje!`,
        html: `<p>Hola ${name},</p><p>Tu solicitud para unirte al viaje con origen <strong>${origin}</strong> hacia destino <strong>${destination}</strong> ha sido aprobada. ¡Nos vemos en el viaje!</p>`,
      },
      rejected: {
        subject: 'Solicitud Rechazada',
        text: `Hola ${name},\n\nLamentablemente, tu solicitud para unirte al viaje con origen ${origin} hacia destino ${destination} ha sido rechazada.` +
          (rejectionReason ? ` Motivo: ${rejectionReason}` : ''),
        html: `<p>Hola ${name},</p><p>Lamentablemente, tu solicitud para unirte al viaje con origen <strong>${origin}</strong> hacia destino <strong>${destination}</strong> ha sido rechazada.</p>` +
          (rejectionReason ? `<p>Motivo: ${rejectionReason}</p>` : ''),
      },
      cancelled: {
        subject: 'Inscripción Cancelada',
        text: `Hola ${name},\n\nTu inscripción al viaje con origen ${origin} hacia destino ${destination} ha sido cancelada con éxito. Te esperamos en próximos viajes!`,
        html: `<p>Hola ${name},</p><p>Tu inscripción al viaje con origen <strong>${origin}</strong> hacia destino <strong>${destination}</strong> ha sido cancelada con éxito. Te esperamos en próximos viajes!</p>`,
      },
    };


    const message = statusMessages[status];

    if (!message) {
      throw new Error(`Estado desconocido para enviar email: ${status}`);
    }

    // Opciones para enviar el correo
    const mailOptions = {
      from: '"TripBook" <tripbook14@gmail.com>',
      to: email,
      subject: message.subject,
      text: message.text,
      html: message.html,
    };

    // Enviar el correo
    await this.transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error al enviar el correo:', error);
      } else {
        console.log('Correo enviado:', info.response);
      }
    });
  }
}
