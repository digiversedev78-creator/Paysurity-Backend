import { Injectable, Scope } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks'; // Node.js built-in for context management

// PaySurity platform shared modules
// Assuming AuditLogModule is also a shared package

/**
 * Defines the structure of data stored in the request context.
 * This context is accessible throughout a single request's lifecycle.
 */
export interface RequestContextData {
  userId?: string;
  traceId?: string;
  organizationId?: string;
  userRoles?: string[]; // Array of roles for the authenticated user
  correlationId?: string; // A unique ID for tracing related requests across services
  ipAddress?: string; // IP address of the client making the request
  userAgent?: string; // User-Agent header from the client
  // Add any other request-specific data that needs to be globally accessible within a request
}

/**
 * A service that manages and provides access to request-scoped data.
 * It uses Node.js's AsyncLocalStorage to ensure context is propagated across async operations.
 */
@Injectable({ scope: Scope.REQUEST }) // Ensure this service is instantiated per request
export class RequestContextService {
  // Static AsyncLocalStorage instance to store and retrieve context data
  private static als = new AsyncLocalStorage<RequestContextData>();

  /**
   * Initializes a new asynchronous context and executes a callback function within it.
   * This method is typically called by a global interceptor or middleware at the start of an HTTP request
   * to set up the request context.
   * @param data The initial data to populate the request context with.
   * @param callback The function to execute within the newly established context.
   * @returns The result of the callback function.
   */
  static run<R>(data: RequestContextData, callback: (...args: any[]) => R): R {
    return RequestContextService.als.run(data, callback);
  }

  /**
   * Retrieves the current request context data.
   * @returns The `RequestContextData` object if a context is active, otherwise `undefined`.
   */
  get context(): RequestContextData | undefined {
    return RequestContextService.als.getStore();
  }

  /**
   * Retrieves a specific value from the current request context.
   * @param key The key of the data property to retrieve.
   * @returns The value associated with the key, or `undefined` if the key is not found
   * or no request context is active.
   */
  getValue<K extends keyof RequestContextData>(key: K): RequestContextData[K] | undefined {
    return this.context?.[key];
  }

  /**
   * Sets or updates a value in the current request context.
   * This method should only be called if a context has already been initialized
   * for the current asynchronous flow (i.e., `RequestContextService.run` has been called).
   * @param key The key of the data property to set.
   * @param value The value to set for the given key.
   */
  setValue<K extends keyof RequestContextData>(key: K, value: RequestContextData[K]): void {
    const store = RequestContextService.als.getStore();
    if (store) {
      store[key] = value;
    }
  }
}
