import { Injectable, Inject } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@paysurity/database'; // This should contain all Drizzle schemas
import { InferInsertModel, InferSelectModel, eq, and, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid'; // For generating request IDs

/**
 * Defines the structure of the data stored in the request context.
 * This data is specific to the current request and propagated asynchronously.
 */
export interface RequestContextData {
  requestId: string;
  userId?: string;
  tenantId?: string;
  // Add any other request-specific data you need to propagate
  [key: string]: any;
}

/**
 * Drizzle types for the `requestContextLogs` table, assuming it exists
 * within the `@paysurity/database` schema. This table is used to log
 * lifecycle events of request contexts for auditing or debugging.
 */
type RequestContextLog = InferSelectModel<typeof schema.requestContextLogs>;
type InsertRequestContextLog = InferInsertModel<typeof schema.requestContextLogs>;

/**
 * Service to manage request-specific context using AsyncLocalStorage.
 * This allows data (like request ID, user ID, tenant ID) to be
 * available throughout the request lifecycle without explicit passing.
 * It also includes CRUD operations for logging context events to the database.
 */
@Injectable()
export class RequestContextService {
  // AsyncLocalStorage is used to store request-specific data that
  // needs to be accessible across asynchronous operations within the same request.
  private readonly als = new AsyncLocalStorage<RequestContextData>();

  constructor(
    // Inject the Drizzle ORM database client.
    // The type `typeof schema` provides strong typing for table interactions.
    @Inject('DATABASE') private db: NodePgDatabase<typeof schema>,
  ) {}

  /**
   * Runs a provided callback function within a new asynchronous context,
   * initialized with the given data. This method is typically called
   * by a middleware or interceptor at the beginning of a request.
   * A `requestId` is generated if not provided in the initial data.
   *
   * @param initialData Partial data to initialize the request context.
   * @param callback The function to execute within the new context.
   * @returns The result of the callback function.
   */
  public async run<T>(initialData: Partial<RequestContextData>, callback: () => T | Promise<T>): Promise<T> {
    const contextData: RequestContextData = {
      requestId: initialData.requestId || uuidv4(), // Ensure a unique request ID
      ...initialData,
    };

    // Log the initialization of this context to the database.
    await this.logContextActivity('initialized', contextData);

    // Execute the callback within the new AsyncLocalStorage context.
    return this.als.run(contextData, callback);
  }

  /**
   * Retrieves a specific value from the current request context.
   *
   * @param key The key of the data to retrieve (e.g., 'userId', 'requestId').
   * @returns The value associated with the key, or `undefined` if not found or no context is active.
   */
  public get<K extends keyof RequestContextData>(key: K): RequestContextData[K] | undefined;
  public get(key: string): any | undefined;
  public get(key: string): any | undefined {
    const store = this.als.getStore();
    return store ? store[key] : undefined;
  }

  /**
   * Retrieves the entire current request context object.
   *
   * @returns The `RequestContextData` object, or `undefined` if no context is active.
   */
  public getContext(): RequestContextData | undefined {
    return this.als.getStore();
  }

  /**
   * Sets or updates a specific value in the current request context.
   * This action is also logged to the database.
   *
   * @param key The key to set or update.
   * @param value The value to associate with the key.
   */
  public async set<K extends keyof RequestContextData>(key: K, value: RequestContextData[K]): Promise<void>;
  public async set(key: string, value: any): Promise<void>;
  public async set(key: string, value: any): Promise<void> {
    const store = this.als.getStore();
    if (store) {
      store[key] = value;
      // Log the context update.
      await this.logContextActivity(`updated_${String(key)}`, store);
    }
  }

  /**
   * Updates multiple values in the current request context from an object.
   * This action is also logged to the database.
   *
   * @param updates An object containing key-value pairs to update.
   */
  public async updateContext(updates: Partial<RequestContextData>): Promise<void> {
    const store = this.als.getStore();
    if (store) {
      Object.assign(store, updates);
      // Log the context update.
      await this.logContextActivity('updated_multiple', store);
    }
  }

  /**
   * Checks if a request context is currently active.
   *
   * @returns `true` if a context is active, `false` otherwise.
   */
  public isActive(): boolean {
    return this.als.getStore() !== undefined;
  }
}
