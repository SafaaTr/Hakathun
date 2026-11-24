import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../../database/schemas/user.schema';
import { Pet, PetDocument } from '../../database/schemas/pet.schema';
import { Store, StoreDocument } from '../../database/schemas/store.schema';
import { HostProfile, HostProfileDocument } from '../../database/schemas/host-profile.schema';
import { VetProfile, VetProfileDocument } from '../../database/schemas/vet-profile.schema';
import { Order, OrderDocument } from '../../database/schemas/order.schema';
import { VetBooking, VetBookingDocument } from '../../database/schemas/vet-booking.schema';
import { HostBooking, HostBookingDocument } from '../../database/schemas/host-booking.schema';
import { Review, ReviewDocument } from '../../database/schemas/review.schema';
import { AdminCreateDoctorDto } from './dto/admin-create-doctor.dto';
import { AdminCreateHostDto } from './dto/admin-create-host.dto';
import { CreateStoreDto } from './dto/create-store.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Pet.name) private petModel: Model<PetDocument>,
    @InjectModel(Store.name) private storeModel: Model<StoreDocument>,
    @InjectModel(HostProfile.name) private hostProfileModel: Model<HostProfileDocument>,
    @InjectModel(VetProfile.name) private vetProfileModel: Model<VetProfileDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(VetBooking.name) private vetBookingModel: Model<VetBookingDocument>,
    @InjectModel(HostBooking.name) private hostBookingModel: Model<HostBookingDocument>,
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
  ) {}

  // 1. Doctors Management
  async getDoctors() {
    const profiles = await this.vetProfileModel.find().populate('userId', 'name phone isActive').exec();
    return Promise.all(
      profiles.map(async (p) => {
        const u = p.userId as any;
        const doctorId = u?._id?.toString() || p.userId.toString();
        const reviews = await this.reviewModel.find({ targetType: 'doctor', targetId: doctorId });
        const ratingsCount = reviews.length;
        const avgRating = ratingsCount > 0
          ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / ratingsCount).toFixed(1))
          : 5.0;

        return {
          id: p._id,
          doctorId,
          name: u?.name || 'Doctor',
          phone: u?.phone || '',
          address: p.address,
          status: p.status,
          avgRating,
          ratingsCount,
        };
      }),
    );
  }

  async createDoctor(dto: AdminCreateDoctorDto) {
    const rawPassword = dto.password || 'Doctor12345!';
    if (dto.password && dto.confirmPassword && dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Invalid name, password, or phone number. Please re-enter.');
    }

    const existing = await this.userModel.findOne({
      $or: [{ name: dto.name.trim() }, { phone: dto.phone.trim() }],
    });
    if (existing) {
      if (existing.phone === dto.phone.trim()) {
        throw new BadRequestException('رقم الهاتف مسجل مسبقاً. يرجى استخدام رقم هاتف آخر (This phone number is already registered).');
      }
      throw new BadRequestException('هذا الاسم مسجل مسبقاً. يرجى استخدام اسم آخر (This name is already registered).');
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(rawPassword, salt);

    const user = new this.userModel({
      name: dto.name.trim(),
      phone: dto.phone.trim(),
      passwordHash: hash,
      roles: ['veterinarian'],
      isActive: true,
    });
    await user.save();

    const profile = new this.vetProfileModel({
      userId: user._id,
      address: dto.address,
      status: 'available',
    });
    await profile.save();

    return {
      id: profile._id,
      doctorId: user._id,
      name: user.name,
      phone: user.phone,
      address: profile.address,
      status: profile.status,
    };
  }

  async updateDoctor(doctorIdOrProfileId: string, updateData: any) {
    let profile = await this.vetProfileModel.findById(doctorIdOrProfileId);
    if (!profile) {
      profile = await this.vetProfileModel.findOne({ userId: new Types.ObjectId(doctorIdOrProfileId) });
    }
    if (!profile) {
      throw new NotFoundException('Doctor profile not found.');
    }

    if (updateData.status) profile.status = updateData.status;
    if (updateData.address) profile.address = updateData.address;
    await profile.save();

    if (updateData.name || updateData.phone) {
      const userUpdate: any = {};
      if (updateData.name) userUpdate.name = updateData.name;
      if (updateData.phone) userUpdate.phone = updateData.phone;
      await this.userModel.findByIdAndUpdate(profile.userId, userUpdate);
    }

    return profile;
  }

  // 2. Hosts Management
  async getHosts() {
    const profiles = await this.hostProfileModel.find().populate('userId', 'name phone isActive').exec();
    return Promise.all(
      profiles.map(async (h) => {
        const u = h.userId as any;
        const hostUserId = u?._id?.toString() || h.userId.toString();
        const reviews = await this.reviewModel.find({ targetType: 'host_caregiver', targetId: hostUserId });
        const ratingsCount = reviews.length;
        const avgRating = ratingsCount > 0
          ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / ratingsCount).toFixed(1))
          : 5.0;

        return {
          id: h._id,
          hostUserId,
          name: u?.name || 'Caregiver',
          phone: u?.phone || '',
          placeType: h.placeType,
          address: h.address,
          acceptedPetType: h.acceptedPetType,
          pricingType: h.pricingType,
          dailyPrice: h.dailyPrice,
          foodCost: h.foodCost,
          status: h.status,
          avgRating,
          ratingsCount,
        };
      }),
    );
  }

  async createHost(dto: AdminCreateHostDto) {
    const rawPassword = dto.password || 'Host12345!';
    if (dto.password && dto.confirmPassword && dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Invalid name, password, or phone number. Please re-enter.');
    }

    const existing = await this.userModel.findOne({
      $or: [{ name: dto.name.trim() }, { phone: dto.phone.trim() }],
    });
    if (existing) {
      if (existing.phone === dto.phone.trim()) {
        throw new BadRequestException('رقم الهاتف مسجل مسبقاً. يرجى استخدام رقم هاتف آخر (This phone number is already registered).');
      }
      throw new BadRequestException('هذا الاسم مسجل مسبقاً. يرجى استخدام اسم آخر (This name is already registered).');
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(rawPassword, salt);

    const user = new this.userModel({
      name: dto.name.trim(),
      phone: dto.phone.trim(),
      passwordHash: hash,
      roles: ['host_caregiver'],
      isActive: true,
    });
    await user.save();

    const profile = new this.hostProfileModel({
      userId: user._id,
      placeType: dto.placeType,
      address: dto.address,
      acceptedPetType: dto.acceptedPetType,
      pricingType: dto.pricingType,
      dailyPrice: dto.pricingType === 'paid' ? dto.dailyPrice : null,
      foodCost: dto.foodCost,
      status: 'available',
    });
    await profile.save();

    return {
      id: profile._id,
      hostUserId: user._id,
      name: user.name,
      phone: user.phone,
      ...dto,
      status: profile.status,
    };
  }

  async updateHost(hostIdOrProfileId: string, updateData: any) {
    let profile = await this.hostProfileModel.findById(hostIdOrProfileId);
    if (!profile) {
      profile = await this.hostProfileModel.findOne({ userId: new Types.ObjectId(hostIdOrProfileId) });
    }
    if (!profile) {
      throw new NotFoundException('Host profile not found.');
    }

    Object.assign(profile, updateData);
    await profile.save();

    if (updateData.name || updateData.phone) {
      const userUpdate: any = {};
      if (updateData.name) userUpdate.name = updateData.name;
      if (updateData.phone) userUpdate.phone = updateData.phone;
      await this.userModel.findByIdAndUpdate(profile.userId, userUpdate);
    }

    return profile;
  }

  // 3. Pet Owners (Read-only for Admin)
  async getPetOwners() {
    const owners = await this.userModel.find({ roles: 'pet_owner' }).exec();
    return Promise.all(
      owners.map(async (u) => {
        const petsCount = await this.petModel.countDocuments({ ownerId: u._id }).exec();
        const reviews = await this.reviewModel.find({ targetType: 'pet_owner', targetId: u._id.toString() });
        const ratingsCount = reviews.length;
        const avgRating = ratingsCount > 0
          ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / ratingsCount).toFixed(1))
          : 5.0;

        return {
          id: u._id,
          _id: u._id,
          name: u.name,
          phone: u.phone,
          petsCount,
          avgRating,
          ratingsCount,
          createdAt: (u as any).createdAt,
        };
      }),
    );
  }

  // 4. Stores Management
  async getStores() {
    return this.storeModel.find().populate('ownerId', 'name phone').exec();
  }

  async createStore(dto: CreateStoreDto) {
    let ownerId = dto.ownerId;
    if (!ownerId) {
      let owner = await this.userModel.findOne({
        $or: [{ phone: dto.phone.trim() }, { name: dto.name.trim() }],
      });
      if (!owner) {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(dto.password || 'StorePass123', salt);
        owner = new this.userModel({
          name: dto.name.trim(),
          phone: dto.phone.trim(),
          passwordHash: hash,
          roles: ['store_owner'],
          isActive: true,
        });
        await owner.save();
      }
      ownerId = owner._id.toString();
    }

    const store = new this.storeModel({
      name: dto.name,
      phone: dto.phone,
      address: dto.address,
      description: dto.description || `${dto.name} - Authorized Pet Store`,
      imageUrl: dto.imageUrl || 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400',
      userId: new Types.ObjectId(ownerId),
      ownerId: new Types.ObjectId(ownerId),
      status: 'active',
    });
    await store.save();

    await this.userModel.findByIdAndUpdate(ownerId, {
      $set: { roles: ['store_owner'] },
    });

    return store;
  }

  async updateStoreStatus(storeId: string, status: string) {
    const store = await this.storeModel.findById(storeId).exec();
    if (!store) {
      throw new NotFoundException('Store not found.');
    }
    store.status = status;
    await store.save();
    return store;
  }

  // 5. Statistics
  async getPlatformStats() {
    const [
      usersCount,
      petsCount,
      storesCount,
      ordersCount,
      vetBookingsCount,
      hostBookingsCount,
    ] = await Promise.all([
      this.userModel.countDocuments().exec(),
      this.petModel.countDocuments().exec(),
      this.storeModel.countDocuments().exec(),
      this.orderModel.countDocuments().exec(),
      this.vetBookingModel.countDocuments().exec(),
      this.hostBookingModel.countDocuments().exec(),
    ]);

    return {
      usersCount,
      petsCount,
      storesCount,
      ordersCount,
      vetBookingsCount,
      hostBookingsCount,
    };
  }

  // 6. Platform Orders (Admin Supervision)
  async getAllOrders() {
    return this.orderModel.find().sort({ createdAt: -1 }).limit(30).exec();
  }
}
