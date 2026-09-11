import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { users } from '@paysurity/database';

@Injectable()
export class DrizzleService {
  constructor(@Inject('DATABASE') private db: NodePgDatabase<any>) {}

  async findUserById(id: string) {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0] || null;
  }

  async findUserByEmail(email: string) {
    const result = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0] || null;
  }

  async createUser(userData: typeof users.$inferInsert) {
    const [newUser] = await this.db.insert(users).values(userData).returning();
    return newUser;
  }

  async updateUser(id: string, userData: Partial<typeof users.$inferInsert>) {
    const [updatedUser] = await this.db.update(users).set(userData).where(eq(users.id, id)).returning();
    return updatedUser || null;
  }

  async deleteUser(id: string) {
    const [deletedUser] = await this.db.delete(users).where(eq(users.id, id)).returning();
    return deletedUser || null;
  }

  async findAllUsers() {
    return this.db.select().from(users);
  }
}
