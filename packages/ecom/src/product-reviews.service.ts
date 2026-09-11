import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { productReviews } from '@paysurity/database'; // Assuming 'productReviews' is the table schema from @paysurity/database
import { eq, and, gt, lt } from 'drizzle-orm';

// Define interface for creating a product review
interface CreateProductReviewDto {
  productId: string;
  userId: string;
  rating: number; // e.g., 1-5
  comment?: string;
}

// Define interface for updating a product review
interface UpdateProductReviewDto {
  rating?: number;
  comment?: string;
}

// Define interface for filtering product reviews
interface FindProductReviewsDto {
  productId?: string;
  userId?: string;
  minRating?: number;
  maxRating?: number;
  page?: number;
  limit?: number;
}

@Injectable()
export class ProductReviewsService {
  constructor(@Inject('DATABASE') private db: NodePgDatabase<any>) {}

  async create(createReviewDto: CreateProductReviewDto) {
    const [newReview] = await this.db
      .insert(productReviews)
      .values({
        ...createReviewDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return newReview;
  }

  async findAll(filters: FindProductReviewsDto = {}) {
    const { productId, userId, minRating, maxRating, page = 1, limit = 10 } = filters;

    const whereConditions = [];
    if (productId) {
      whereConditions.push(eq(productReviews.productId, productId));
    }
    if (userId) {
      whereConditions.push(eq(productReviews.userId, userId));
    }
    if (minRating !== undefined) {
      whereConditions.push(gt(productReviews.rating, minRating - 1)); // greater than (minRating-1) to include minRating
    }
    if (maxRating !== undefined) {
      whereConditions.push(lt(productReviews.rating, maxRating + 1)); // less than (maxRating+1) to include maxRating
    }

    const reviews = await this.db
      .select()
      .from(productReviews)
      .where(and(...whereConditions))
      .limit(limit)
      .offset((page - 1) * limit);

    return reviews;
  }

  async findOne(id: string) {
    const [review] = await this.db
      .select()
      .from(productReviews)
      .where(eq(productReviews.id, id))
      .limit(1);

    if (!review) {
      throw new NotFoundException(`Product review with ID "${id}" not found.`);
    }
    return review;
  }

  async update(id: string, updateReviewDto: UpdateProductReviewDto) {
    const [updatedReview] = await this.db
      .update(productReviews)
      .set({
        ...updateReviewDto,
        updatedAt: new Date(),
      })
      .where(eq(productReviews.id, id))
      .returning();

    if (!updatedReview) {
      throw new NotFoundException(`Product review with ID "${id}" not found.`);
    }
    return updatedReview;
  }

  async remove(id: string) {
    const [deletedReview] = await this.db
      .delete(productReviews)
      .where(eq(productReviews.id, id))
      .returning({ id: productReviews.id });

    if (!deletedReview) {
      throw new NotFoundException(`Product review with ID "${id}" not found.`);
    }
    return deletedReview; // Returns the ID of the deleted review
  }
}
