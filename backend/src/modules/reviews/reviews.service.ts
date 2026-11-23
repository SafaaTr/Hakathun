import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review, ReviewDocument } from '../../database/schemas/review.schema';
import { VetBooking, VetBookingDocument } from '../../database/schemas/vet-booking.schema';
import { HostBooking, HostBookingDocument } from '../../database/schemas/host-booking.schema';
import { CreateReviewDto } from './dto/create-review.dto';
import * as crypto from 'crypto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    @InjectModel(VetBooking.name) private vetBookingModel: Model<VetBookingDocument>,
    @InjectModel(HostBooking.name) private hostBookingModel: Model<HostBookingDocument>,
  ) {}

  private generateReference(): string {
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `RVW-${randomHex}`;
  }

  async createReview(fromUserId: string, dto: CreateReviewDto) {
    let targetType = '';
    let targetId = '';

    // Validate booking completion and determine targetType & targetId
    if (dto.bookingType === 'vet_booking') {
      const booking = await this.vetBookingModel.findById(dto.bookingId).exec();
      if (!booking) {
        throw new NotFoundException('Vet appointment booking not found.');
      }

      if (booking.status !== 'approved') {
        throw new BadRequestException('You can rate only after the service is completed.');
      }

      if (booking.customerId.toString() !== fromUserId) {
        throw new BadRequestException('You can rate only after the service is completed.');
      }

      targetType = 'doctor';
      targetId = booking.doctorId.toString();
    } else if (dto.bookingType === 'host_booking') {
      const booking = await this.hostBookingModel.findById(dto.bookingId).exec();
      if (!booking) {
        throw new NotFoundException('Host booking not found.');
      }

      const isCompleted = booking.status === 'approved' && new Date(booking.endDate) <= new Date();
      if (!isCompleted) {
        throw new BadRequestException('You can rate only after the service is completed.');
      }

      // Check whether reviewer is pet_owner or host_caregiver
      if (booking.petOwnerId.toString() === fromUserId) {
        // Pet owner rates the host caregiver
        targetType = 'host_caregiver';
        targetId = booking.hostUserId.toString();
      } else if (booking.hostUserId.toString() === fromUserId) {
        // Host caregiver rates the pet owner
        targetType = 'pet_owner';
        targetId = booking.petOwnerId.toString();
      } else {
        throw new BadRequestException('You are not a participant in this booking.');
      }
    }

    // Check duplicate review
    const existing = await this.reviewModel.findOne({
      fromUserId: new Types.ObjectId(fromUserId),
      bookingType: dto.bookingType,
      bookingId: new Types.ObjectId(dto.bookingId),
    }).exec();

    if (existing) {
      throw new BadRequestException('You have already rated this booking.');
    }

    const referenceCode = this.generateReference();
    const review = new this.reviewModel({
      referenceCode,
      fromUserId: new Types.ObjectId(fromUserId),
      targetType,
      targetId,
      bookingType: dto.bookingType,
      bookingId: new Types.ObjectId(dto.bookingId),
      rating: dto.rating,
      comment: dto.comment || '',
    });

    await review.save();
    return review;
  }

  async getReviewsForTarget(targetType: string, targetId: string, page = 1, limit = 5) {
    const skip = (page - 1) * limit;

    const [reviews, totalCount] = await Promise.all([
      this.reviewModel
        .find({ targetType, targetId })
        .populate('fromUserId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.reviewModel.countDocuments({ targetType, targetId }).exec(),
    ]);

    const allReviews = await this.reviewModel.find({ targetType, targetId }).exec();
    const ratingsCount = allReviews.length;
    const avgRating =
      ratingsCount > 0
        ? Number((allReviews.reduce((acc, r) => acc + r.rating, 0) / ratingsCount).toFixed(1))
        : 5.0;

    const formattedReviews = reviews.map((r) => ({
      id: r._id,
      referenceCode: r.referenceCode,
      rating: r.rating,
      comment: r.comment,
      reviewerName: (r.fromUserId as any)?.name || 'Anonymous',
      createdAt: (r as any).createdAt,
    }));

    return {
      avgRating,
      ratingsCount,
      reviews: formattedReviews,
      totalCount,
    };
  }
}
