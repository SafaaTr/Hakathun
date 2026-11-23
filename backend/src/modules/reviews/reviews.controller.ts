import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Reviews & Ratings')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit a rating/review (1-5) for an approved booking' })
  async createReview(
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateReviewDto,
  ) {
    const review = await this.reviewsService.createReview(userId, dto);
    return {
      message: 'Thank you for your rating.',
      data: review,
    };
  }

  @Get(':targetType/:targetId')
  @ApiOperation({ summary: 'Get aggregated ratings and reviews list (5 latest by default)' })
  async getReviewsForTarget(
    @Param('targetType') targetType: string,
    @Param('targetId') targetId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const p = page ? Number(page) : 1;
    const l = limit ? Number(limit) : 5;
    return this.reviewsService.getReviewsForTarget(targetType, targetId, p, l);
  }
}
