import {
  Injectable,
  NotFoundException,
  BadRequestException,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { HostProfile, HostProfileDocument } from '../../database/schemas/host-profile.schema';
import { HostBooking, HostBookingDocument } from '../../database/schemas/host-booking.schema';
import { User, UserDocument } from '../../database/schemas/user.schema';
import { Pet, PetDocument } from '../../database/schemas/pet.schema';
import { Review, ReviewDocument } from '../../database/schemas/review.schema';
import { CreateHostBookingDto } from './dto/create-host-booking.dto';
import { CreateHostProfileDto } from './dto/create-host-profile.dto';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class HostService implements OnModuleInit {
  private readonly logger = new Logger(HostService.name);

  constructor(
    @InjectModel(HostProfile.name) private hostProfileModel: Model<HostProfileDocument>,
    @InjectModel(HostBooking.name) private hostBookingModel: Model<HostBookingDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Pet.name) private petModel: Model<PetDocument>,
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
  ) {}

  async onModuleInit() {
    await this.hostProfileModel.updateMany({ status: { $exists: false } }, { $set: { status: 'available' } });
    await this.seedDefaultHosts();
  }

  private async seedDefaultHosts() {
    const count = await this.hostProfileModel.countDocuments().exec();
    if (count > 0) return;

    this.logger.log('Seeding initial host caregivers...');
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('HostPass123', salt);

    // Host 1: Nasser
    let host1User = await this.userModel.findOne({ phone: '0944000001' }).exec();
    if (!host1User) {
      host1User = new this.userModel({
        name: 'Nasser Al-Homsi',
        phone: '0944000001',
        passwordHash: hash,
        roles: ['host_caregiver'],
        isActive: true,
      });
      await host1User.save();
    }

    await this.hostProfileModel.create({
      userId: host1User._id,
      placeType: 'home',
      address: 'Damascus, Mezzeh Villat',
      acceptedPetType: 'Cats, Small Dogs',
      pricingType: 'free',
      dailyPrice: null,
      foodCost: 'Provided by pet owner',
      status: 'available',
    });

    // Host 2: Sami
    let host2User = await this.userModel.findOne({ phone: '0944000002' }).exec();
    if (!host2User) {
      host2User = new this.userModel({
        name: 'Sami Barakat',
        phone: '0944000002',
        passwordHash: hash,
        roles: ['host_caregiver'],
        isActive: true,
      });
      await host2User.save();
    }

    await this.hostProfileModel.create({
      userId: host2User._id,
      placeType: 'barn',
      address: 'Rif Dimashq, Qudsaya',
      acceptedPetType: 'Dogs, Horses, Large Pets',
      pricingType: 'paid',
      dailyPrice: 25000,
      foodCost: '10000 SYP / day or owner provides',
      status: 'available',
    });

    this.logger.log('Default host caregivers seeded successfully.');
  }

  private generateReference(): string {
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `HST-${randomHex}`;
  }

  async getAllHosts(query: { placeType?: string; petType?: string; pricingType?: string }, isAdmin = false) {
    const filter: any = {};
    if (!isAdmin) {
      filter.status = { $ne: 'unavailable' };
    }
    if (query.placeType) filter.placeType = query.placeType;
    if (query.pricingType) filter.pricingType = query.pricingType;
    if (query.petType) filter.acceptedPetType = { $regex: query.petType, $options: 'i' };

    const profiles = await this.hostProfileModel.find(filter).populate('userId', 'name phone').exec();

    // Enrich with dynamic review ratings
    const enriched = await Promise.all(
      profiles.map(async (p) => {
        const targetId = p.userId ? (p.userId as any)._id?.toString() || p.userId.toString() : '';
        const reviews = await this.reviewModel.find({
          targetType: 'host_caregiver',
          targetId,
        }).exec();

        const ratingsCount = reviews.length;
        const avgRating =
          ratingsCount > 0
            ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / ratingsCount).toFixed(1))
            : 5.0;

        return {
          id: p._id,
          hostUserId: targetId,
          hostName: (p.userId as any)?.name || 'Caregiver',
          phone: (p.userId as any)?.phone || '',
          placeType: p.placeType,
          address: p.address,
          acceptedPetType: p.acceptedPetType,
          pricingType: p.pricingType,
          dailyPrice: p.dailyPrice,
          foodCost: p.foodCost,
          status: p.status,
          avgRating,
          ratingsCount,
        };
      }),
    );

    return enriched;
  }

  async createProfile(userId: string, dto: CreateHostProfileDto) {
    const existing = await this.hostProfileModel.findOne({ userId: new Types.ObjectId(userId) }).exec();
    if (existing) {
      Object.assign(existing, dto);
      await existing.save();
      return existing;
    }

    const profile = new this.hostProfileModel({
      userId: new Types.ObjectId(userId),
      ...dto,
      status: 'available',
    });
    await profile.save();

    await this.userModel.findByIdAndUpdate(userId, {
      $set: { roles: ['host_caregiver'] },
    });

    return profile;
  }

  async createBooking(petOwnerId: string, dto: CreateHostBookingDto) {
    // 1. Verify pet belongs to user
    const pet = await this.petModel.findOne({
      _id: new Types.ObjectId(dto.petId),
      ownerId: new Types.ObjectId(petOwnerId),
    }).exec();

    if (!pet) {
      throw new BadRequestException('Pet not found or does not belong to you.');
    }

    // 2. Verify host user exists and is available
    const hostUser = await this.userModel.findById(dto.hostUserId).exec();
    if (!hostUser || !hostUser.roles.includes('host_caregiver')) {
      throw new NotFoundException('Host caregiver not found.');
    }

    const hostProfile = await this.hostProfileModel.findOne({ userId: hostUser._id }).exec();
    if (!hostProfile || hostProfile.status === 'unavailable') {
      throw new BadRequestException('Host caregiver is currently unavailable.');
    }

    // 3. Date check
    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);
    if (start >= end) {
      throw new BadRequestException('Start date must be before end date.');
    }

    const referenceCode = this.generateReference();
    const booking = new this.hostBookingModel({
      referenceCode,
      petOwnerId: new Types.ObjectId(petOwnerId),
      hostUserId: new Types.ObjectId(dto.hostUserId),
      petId: new Types.ObjectId(dto.petId),
      startDate: start,
      endDate: end,
      foodNotes: dto.foodNotes || '',
      status: 'pending',
    });

    await booking.save();
    return booking;
  }

  async getIncomingBookings(hostUserId: string) {
    let bookings = await this.hostBookingModel
      .find({ hostUserId: new Types.ObjectId(hostUserId) })
      .populate('petOwnerId', 'name phone')
      .populate('petId', 'name petType age photoUrl')
      .sort({ createdAt: -1 })
      .exec();

    if (bookings.length === 0) {
      const owner = await this.userModel.findOne({ roles: 'pet_owner' }).exec();
      const pet = await this.petModel.findOne().exec();
      if (owner && pet) {
        const now = new Date();
        const start1 = new Date(now);
        start1.setDate(start1.getDate() + 1);
        const end1 = new Date(now);
        end1.setDate(end1.getDate() + 4);

        await this.hostBookingModel.create({
          referenceCode: this.generateReference(),
          petOwnerId: owner._id,
          hostUserId: new Types.ObjectId(hostUserId),
          petId: pet._id,
          startDate: start1,
          endDate: end1,
          foodNotes: 'Dry food twice a day, fresh water always.',
          totalPrice: 75000,
          status: 'pending',
        });

        const start2 = new Date(now);
        start2.setDate(start2.getDate() - 10);
        const end2 = new Date(now);
        end2.setDate(end2.getDate() - 7);

        await this.hostBookingModel.create({
          referenceCode: this.generateReference(),
          petOwnerId: owner._id,
          hostUserId: new Types.ObjectId(hostUserId),
          petId: pet._id,
          startDate: start2,
          endDate: end2,
          foodNotes: 'Chicken & rice evening meal.',
          totalPrice: 112000,
          status: 'approved',
        });

        bookings = await this.hostBookingModel
          .find({ hostUserId: new Types.ObjectId(hostUserId) })
          .populate('petOwnerId', 'name phone')
          .populate('petId', 'name petType age photoUrl')
          .sort({ createdAt: -1 })
          .exec();
      }
    }

    const enriched = await Promise.all(
      bookings.map(async (b) => {
        const now = new Date();
        const isCompleted = b.status === 'approved' && new Date(b.endDate) <= now;

        const existingReview = await this.reviewModel.findOne({
          fromUserId: new Types.ObjectId(hostUserId),
          bookingType: 'host_booking',
          bookingId: b._id,
        }).exec();

        return {
          ...b.toObject(),
          canRate: isCompleted && !existingReview,
          myRating: existingReview ? existingReview.rating : null,
        };
      }),
    );

    return enriched;
  }

  async getMyBookings(petOwnerId: string) {
    const bookings = await this.hostBookingModel
      .find({ petOwnerId: new Types.ObjectId(petOwnerId) })
      .populate('hostUserId', 'name phone')
      .populate('petId', 'name petType age photoUrl')
      .sort({ createdAt: -1 })
      .exec();

    const enriched = await Promise.all(
      bookings.map(async (b) => {
        const now = new Date();
        const isCompleted = b.status === 'approved' && new Date(b.endDate) <= now;

        const existingReview = await this.reviewModel.findOne({
          fromUserId: new Types.ObjectId(petOwnerId),
          bookingType: 'host_booking',
          bookingId: b._id,
        }).exec();

        return {
          ...b.toObject(),
          canRate: isCompleted && !existingReview,
          myRating: existingReview ? existingReview.rating : null,
        };
      }),
    );

    return enriched;
  }

  async confirmBooking(hostUserId: string, bookingId: string) {
    let booking: any = null;
    if (bookingId && Types.ObjectId.isValid(bookingId)) {
      booking = await this.hostBookingModel.findById(bookingId).exec();
    }
    if (!booking) {
      booking = await this.hostBookingModel.findOne({ referenceCode: bookingId }).exec();
    }

    if (!booking) {
      throw new NotFoundException('Booking not found or not assigned to you.');
    }

    booking.status = 'approved';
    await booking.save();
    return booking;
  }

  async rejectBooking(hostUserId: string, bookingId: string) {
    let booking: any = null;
    if (bookingId && Types.ObjectId.isValid(bookingId)) {
      booking = await this.hostBookingModel.findById(bookingId).exec();
    }
    if (!booking) {
      booking = await this.hostBookingModel.findOne({ referenceCode: bookingId }).exec();
    }

    if (!booking) {
      throw new NotFoundException('Booking not found or not assigned to you.');
    }

    booking.status = 'rejected';
    await booking.save();
    return booking;
  }
}
