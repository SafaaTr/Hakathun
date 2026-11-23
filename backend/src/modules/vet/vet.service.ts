import {
  Injectable,
  NotFoundException,
  BadRequestException,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User, UserDocument } from '../../database/schemas/user.schema';
import { VetProfile, VetProfileDocument } from '../../database/schemas/vet-profile.schema';
import { VetSlot, VetSlotDocument } from '../../database/schemas/vet-slot.schema';
import { VetBooking, VetBookingDocument } from '../../database/schemas/vet-booking.schema';
import { Pet, PetDocument } from '../../database/schemas/pet.schema';
import { Review, ReviewDocument } from '../../database/schemas/review.schema';
import { AddSlotDto } from './dto/add-slot.dto';
import { BookVetDto } from './dto/book-vet.dto';

@Injectable()
export class VetService implements OnModuleInit {
  private readonly logger = new Logger(VetService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(VetProfile.name) private vetProfileModel: Model<VetProfileDocument>,
    @InjectModel(VetSlot.name) private vetSlotModel: Model<VetSlotDocument>,
    @InjectModel(VetBooking.name) private vetBookingModel: Model<VetBookingDocument>,
    @InjectModel(Pet.name) private petModel: Model<PetDocument>,
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
  ) {}

  async onModuleInit() {
    await this.seedVets();
  }

  private async seedVets() {
    const vetCount = await this.userModel.countDocuments({ roles: 'veterinarian' });
    if (vetCount > 0) return;

    this.logger.log('Seeding initial veterinarians and slots...');
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('VetPass123', salt);

    // Vet 1: Dr. Zaid Khouri
    const doc1 = await this.userModel.create({
      name: 'Dr. Zaid Khouri',
      phone: '0933112244',
      passwordHash: hash,
      roles: ['veterinarian'],
      isActive: true,
    });

    await this.vetProfileModel.create({
      userId: doc1._id,
      address: 'Shaalan Pet Clinic, Damascus',
      status: 'available',
    });

    // Vet 2: Dr. Nour Salem
    const doc2 = await this.userModel.create({
      name: 'Dr. Nour Salem',
      phone: '0944887766',
      passwordHash: hash,
      roles: ['veterinarian'],
      isActive: true,
    });

    await this.vetProfileModel.create({
      userId: doc2._id,
      address: 'Mezzeh Autostrad Vet, Damascus',
      status: 'available',
    });

    // Seed weekly slots for next 7 days for Dr. Zaid & Dr. Nour
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const times = ['09:00', '10:00', '11:00', '14:00', '16:00', '18:00'];
    const now = new Date();

    for (const doc of [doc1, doc2]) {
      for (let i = 0; i < 7; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() + i);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;
        const dayName = days[d.getDay()];

        for (const t of times) {
          await this.vetSlotModel.create({
            doctorId: doc._id,
            date: dateStr,
            day: dayName,
            time: t,
            status: 'available',
          });
        }
      }
    }

    this.logger.log('Initial veterinarians and slots seeded successfully.');
  }

  private generateReference(): string {
    const hex = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `VET-${hex}`;
  }

  async getAvailableDoctors() {
    const profiles = await this.vetProfileModel
      .find({ status: 'available' })
      .populate('userId', 'name phone')
      .exec();

    const doctors = await Promise.all(
      profiles.map(async (p) => {
        const userObj = p.userId as any;
        const doctorId = userObj?._id?.toString() || p.userId.toString();
        const reviews = await this.reviewModel.find({
          targetType: 'doctor',
          targetId: doctorId,
        });

        const ratingsCount = reviews.length;
        const avgRating =
          ratingsCount > 0
            ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / ratingsCount).toFixed(1))
            : 5.0;

        return {
          id: doctorId,
          doctorId,
          name: userObj?.name || 'Veterinarian',
          phone: userObj?.phone || '',
          address: p.address,
          status: p.status,
          avgRating,
          ratingsCount,
        };
      }),
    );

    return doctors;
  }

  async getDoctorSlots(doctorId: string) {
    const slots = await this.vetSlotModel
      .find({
        doctorId: new Types.ObjectId(doctorId),
        status: 'available',
      })
      .sort({ date: 1, time: 1 })
      .exec();

    return slots.map((s) => ({
      slotId: s._id.toString(),
      date: s.date,
      day: s.day,
      time: s.time,
      status: s.status,
    }));
  }

  async addSlot(doctorId: string, dto: AddSlotDto) {
    const existing = await this.vetSlotModel.findOne({
      doctorId: new Types.ObjectId(doctorId),
      date: dto.date,
      time: dto.time,
    });

    if (existing) {
      existing.status = 'available';
      await existing.save();
      return existing;
    }

    const slot = new this.vetSlotModel({
      doctorId: new Types.ObjectId(doctorId),
      date: dto.date,
      day: dto.day,
      time: dto.time,
      status: 'available',
    });

    await slot.save();
    return slot;
  }

  async getMyAppointments(doctorId: string) {
    const appointments = await this.vetBookingModel
      .find({ doctorId: new Types.ObjectId(doctorId) })
      .populate('customerId', 'name phone')
      .populate('petId', 'name petType photoUrl age')
      .sort({ createdAt: -1 })
      .exec();

    return appointments;
  }

  async bookAppointment(customerId: string, dto: BookVetDto) {
    // 1. Verify doctor
    const doctorUser = await this.userModel.findById(dto.doctorId);
    if (!doctorUser || !doctorUser.roles.includes('veterinarian')) {
      throw new NotFoundException('Veterinarian not found.');
    }

    // 2. Verify pet
    const pet = await this.petModel.findOne({
      _id: new Types.ObjectId(dto.petId),
      ownerId: new Types.ObjectId(customerId),
    });
    if (!pet) {
      throw new BadRequestException('Pet not found or does not belong to you.');
    }

    // 3. Verify slot
    const slot = await this.vetSlotModel.findOne({
      _id: new Types.ObjectId(dto.slotId),
      doctorId: new Types.ObjectId(dto.doctorId),
      status: 'available',
    });
    if (!slot) {
      throw new BadRequestException('Please select a time slot.');
    }

    const referenceCode = this.generateReference();
    const booking = new this.vetBookingModel({
      referenceCode,
      customerId: new Types.ObjectId(customerId),
      petId: new Types.ObjectId(dto.petId),
      doctorId: new Types.ObjectId(dto.doctorId),
      doctorName: doctorUser.name,
      slotId: slot._id.toString(),
      appointmentDate: slot.date,
      appointmentDay: slot.day,
      appointmentTime: slot.time,
      status: 'pending',
    });

    await booking.save();
    return booking;
  }

  async updateAppointmentStatus(doctorId: string, bookingId: string, status: string) {
    const booking = await this.vetBookingModel.findOne({
      _id: new Types.ObjectId(bookingId),
      doctorId: new Types.ObjectId(doctorId),
    });

    if (!booking) {
      throw new NotFoundException('Appointment booking not found.');
    }

    booking.status = status;
    await booking.save();

    // Lock slot if approved; release if rejected
    if (status === 'approved') {
      await this.vetSlotModel.findByIdAndUpdate(booking.slotId, { status: 'booked' });
    } else if (status === 'rejected') {
      await this.vetSlotModel.findByIdAndUpdate(booking.slotId, { status: 'available' });
    }

    return booking;
  }
}
