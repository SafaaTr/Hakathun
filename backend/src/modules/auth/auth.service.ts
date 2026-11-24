import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../../database/schemas/user.schema';
import { Pet, PetDocument } from '../../database/schemas/pet.schema';
import { HostProfile, HostProfileDocument } from '../../database/schemas/host-profile.schema';
import { VetProfile, VetProfileDocument } from '../../database/schemas/vet-profile.schema';
import { Store, StoreDocument } from '../../database/schemas/store.schema';
import { VetBooking, VetBookingDocument } from '../../database/schemas/vet-booking.schema';
import { HostBooking, HostBookingDocument } from '../../database/schemas/host-booking.schema';
import { Order, OrderDocument } from '../../database/schemas/order.schema';
import { Review, ReviewDocument } from '../../database/schemas/review.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Pet.name) private petModel: Model<PetDocument>,
    @InjectModel(HostProfile.name) private hostProfileModel: Model<HostProfileDocument>,
    @InjectModel(VetProfile.name) private vetProfileModel: Model<VetProfileDocument>,
    @InjectModel(Store.name) private storeModel: Model<StoreDocument>,
    @InjectModel(VetBooking.name) private vetBookingModel: Model<VetBookingDocument>,
    @InjectModel(HostBooking.name) private hostBookingModel: Model<HostBookingDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    private jwtService: JwtService,
  ) {}

  async onModuleInit() {
    await this.seedDefaults();
  }

  private async seedDefaults() {
    try {
      const adminName = process.env.SUPER_ADMIN_NAME || 'admin@rafeeq.sy';
      const adminPass = process.env.SUPER_ADMIN_PASSWORD || 'Admin@2026';
      const adminPhone = process.env.SUPER_ADMIN_PHONE || '0911223344';

      let adminUser = await this.userModel.findOne({
        $or: [{ name: adminName }, { roles: 'admin' }],
      });

      if (!adminUser) {
        const hash = await bcrypt.hash(adminPass, 10);
        await this.userModel.create({
          name: adminName,
          phone: adminPhone,
          passwordHash: hash,
          roles: ['admin'],
          isActive: true,
        });
      } else {
        const hash = await bcrypt.hash(adminPass, 10);
        adminUser.name = adminName;
        adminUser.phone = adminPhone;
        adminUser.passwordHash = hash;
        await adminUser.save();
      }

      const storeOwner = await this.userModel.findOne({ name: 'maya@happypaws.sy' });
      if (!storeOwner) {
        const hash = await bcrypt.hash('StorePass123', 10);
        const owner = await this.userModel.create({
          name: 'maya@happypaws.sy',
          phone: '0933557799',
          passwordHash: hash,
          roles: ['store_owner'],
          isActive: true,
        });

        const storeCount = await this.storeModel.countDocuments();
        if (storeCount === 0) {
          await this.storeModel.create({
            name: 'Happy Paws Pet Store',
            phone: '0933557799',
            address: 'Damascus, Malki Street',
            ownerId: owner._id,
            status: 'active',
          });
        }
      }
    } catch (e) {
      // Ignored if duplicate
    }
  }

  async register(dto: RegisterDto) {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Invalid name, password, or phone number. Please re-enter.');
    }

    const existing = await this.userModel.findOne({
      $or: [{ name: dto.name.trim() }, { phone: dto.phone.trim() }],
    });

    if (existing) {
      throw new BadRequestException('Invalid name, password, or phone number. Please re-enter.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    // NFR-08: Public registration strictly creates pet_owner accounts only
    const user = new this.userModel({
      name: dto.name.trim(),
      phone: dto.phone.trim(),
      passwordHash,
      roles: ['pet_owner'],
      isActive: true,
    });

    await user.save();

    const token = this.generateToken(user);
    return {
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        roles: user.roles,
      },
      accessToken: token,
    };
  }

  async login(dto: LoginDto) {
    const identifier = dto.name.trim();
    const user = await this.userModel.findOne({
      $or: [{ name: identifier }, { phone: identifier }],
    }).select('+passwordHash');
    if (!user) {
      throw new UnauthorizedException('Invalid name or password. Please re-enter.');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid name or password. Please re-enter.');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is inactive.');
    }

    const token = this.generateToken(user);
    return {
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        roles: user.roles,
      },
      accessToken: token,
    };
  }

  private generateToken(user: UserDocument): string {
    const payload = {
      sub: user._id.toString(),
      name: user.name,
      roles: user.roles,
    };
    return this.jwtService.sign(payload);
  }

  async getProfile(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const primaryRole = user.roles && user.roles.length > 0 ? user.roles[0] : 'pet_owner';

    // 1. Pet Owner Profile
    if (primaryRole === 'pet_owner') {
      const pets = await this.petModel.find({ ownerId: user._id });

      const [rawVetBookings, rawHostRequests, orders] = await Promise.all([
        this.vetBookingModel.find({ customerId: user._id }).populate('petId', 'name petType photoUrl').sort({ createdAt: -1 }),
        this.hostBookingModel.find({ petOwnerId: user._id }).populate('hostUserId', 'name phone').populate('petId', 'name petType photoUrl').sort({ createdAt: -1 }),
        this.orderModel.find({ customerId: user._id }).sort({ createdAt: -1 }),
      ]);

      const vetBookings = await Promise.all(
        rawVetBookings.map(async (vb) => {
          const review = await this.reviewModel.findOne({
            fromUserId: user._id,
            bookingType: 'vet_booking',
            bookingId: vb._id,
          });
          const isCompleted = vb.status === 'approved';
          return {
            ...vb.toObject(),
            canRate: isCompleted && !review,
            myRating: review ? review.rating : null,
          };
        }),
      );

      const hostRequests = await Promise.all(
        rawHostRequests.map(async (hb) => {
          const review = await this.reviewModel.findOne({
            fromUserId: user._id,
            bookingType: 'host_booking',
            bookingId: hb._id,
          });
          const isCompleted = hb.status === 'approved' && new Date(hb.endDate) <= new Date();
          return {
            ...hb.toObject(),
            canRate: isCompleted && !review,
            myRating: review ? review.rating : null,
          };
        }),
      );

      return {
        user: {
          id: user._id,
          name: user.name,
          phone: user.phone,
          roles: user.roles,
        },
        pets,
        vetBookings,
        hostRequests,
        orders,
      };
    }

    // 2. Veterinarian Profile
    if (primaryRole === 'veterinarian') {
      const vetProfile = await this.vetProfileModel.findOne({ userId: user._id });
      const reviews = await this.reviewModel.find({ targetType: 'doctor', targetId: user._id.toString() });
      const ratingsCount = reviews.length;
      const avgRating = ratingsCount > 0
        ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / ratingsCount).toFixed(1))
        : 5.0;

      return {
        user: {
          id: user._id,
          name: user.name,
          phone: user.phone,
          roles: user.roles,
        },
        address: vetProfile?.address || '',
        status: vetProfile?.status || 'available',
        avgRating,
        ratingsCount,
      };
    }

    // 3. Host Caregiver Profile
    if (primaryRole === 'host_caregiver') {
      const hostProfile = await this.hostProfileModel.findOne({ userId: user._id });
      const reviews = await this.reviewModel.find({ targetType: 'host_caregiver', targetId: user._id.toString() });
      const ratingsCount = reviews.length;
      const avgRating = ratingsCount > 0
        ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / ratingsCount).toFixed(1))
        : 5.0;

      return {
        user: {
          id: user._id,
          name: user.name,
          phone: user.phone,
          roles: user.roles,
        },
        hostProfile,
        avgRating,
        ratingsCount,
      };
    }

    // 4. Store Owner Profile
    if (primaryRole === 'store_owner') {
      const store = await this.storeModel.findOne({ ownerId: user._id });
      return {
        user: {
          id: user._id,
          name: user.name,
          phone: user.phone,
          roles: user.roles,
        },
        store,
      };
    }

    return {
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        roles: user.roles,
      },
    };
  }

  // FR-13: Update Profile
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    if (dto.name) user.name = dto.name.trim();
    if (dto.phone) user.phone = dto.phone.trim();
    if (dto.password && dto.password.trim().length >= 8) {
      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(dto.password.trim(), salt);
    }
    await user.save();

    const primaryRole = user.roles && user.roles.length > 0 ? user.roles[0] : 'pet_owner';

    if (primaryRole === 'veterinarian' && dto.address) {
      await this.vetProfileModel.findOneAndUpdate(
        { userId: user._id },
        { address: dto.address },
        { upsert: true, new: true },
      );
    } else if (primaryRole === 'host_caregiver') {
      const hostUpdate: any = {};
      if (dto.placeType) hostUpdate.placeType = dto.placeType;
      if (dto.address) hostUpdate.address = dto.address;
      if (dto.acceptedPetType) hostUpdate.acceptedPetType = dto.acceptedPetType;
      if (dto.pricingType) hostUpdate.pricingType = dto.pricingType;
      if (dto.dailyPrice !== undefined) hostUpdate.dailyPrice = dto.dailyPrice;
      if (dto.foodCost) hostUpdate.foodCost = dto.foodCost;

      await this.hostProfileModel.findOneAndUpdate(
        { userId: user._id },
        hostUpdate,
        { upsert: true, new: true },
      );
    } else if (primaryRole === 'store_owner' || user.roles?.includes('store_owner')) {
      if (dto.address) {
        await this.storeModel.findOneAndUpdate(
          { $or: [{ ownerId: user._id }, { userId: user._id }] },
          { address: dto.address.trim() },
          { new: true },
        );
      }
    }

    return {
      message: 'Your profile has been updated.',
    };
  }
}
