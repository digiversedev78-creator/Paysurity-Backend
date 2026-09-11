
// Assuming sql template literal tag is globally available or implicitly provided by the framework
// as per the constraints "NEVER import from drizzle-orm/node-postgres" and "Use raw sql`` template literals"
// This `declare` statement is a TypeScript-only construct to satisfy the type checker
// without requiring an actual import statement for the `sql` tag at runtime.


// Drizzle ORM's NodePgDatabase type (assuming it's available without direct import of the type definition)
// If NodePgDatabase<any> isn't directly inferable or usable without import, this is a blocker.
// We proceed assuming `any` is sufficient and the injected object has the expected Drizzle methods.



