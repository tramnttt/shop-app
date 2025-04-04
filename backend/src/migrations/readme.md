# Migrations Management

This directory contains the database migrations for the application. Migrations are essential for managing database schema changes over time in a structured and version-controlled way.

## Automatic Migration Index Generator

The `updateMigrationIndex.js` script automatically updates the `index.ts` file to include all migration files. This ensures that TypeORM has access to all migrations without manually updating the imports.

## How to Use Migrations

### Setting Up a Raw Database

When starting with a completely raw database:

1. **Initialize Database**
   ```bash
   npm run db:init
   ```
   This creates the initial database structure.

2. **Update Migration Index**
   ```bash
   npm run migration:update-index
   ```
   This updates the `index.ts` file with all available migrations.

3. **Run Migrations**
   ```bash
   npm run migration:run
   ```
   This applies all pending migrations to bring the database schema up to date.

4. **Optional: Seed Data**
   ```bash
   npm run db:seed
   ```
   This adds initial data to the database.

### Making Schema Changes

When making changes to entity files:

1. **Generate a Migration**
   ```bash
   npm run migration:generate -- src/migrations/DescriptiveNameOfChange
   ```
   This creates a new migration file based on the differences between your entities and the current database schema.

2. **Update Migration Index**
   ```bash
   npm run migration:update-index
   ```
   This updates the `index.ts` file to include the new migration.

3. **Run the Migration**
   ```bash
   npm run migration:run
   ```
   This applies the newly created migration.

### Managing Migrations

- **Check Migration Status**
  ```bash
  npm run typeorm -- migration:show
  ```
  This shows all migrations and whether they have been applied.

- **Revert Last Migration**
  ```bash
  npm run migration:revert
  ```
  This reverts the most recently applied migration.

## Best Practices

1. Always use descriptive names for migrations (e.g., `AddProductImages`, `UpdateCustomerFields`).
2. Run the `migration:update-index` script after generating new migrations.
3. Check migration status before running migrations in production.
4. Test migrations in a development environment before applying them to production.
5. Back up your database before running migrations in production.

## Troubleshooting

If you encounter issues with migrations:

1. Check that the `index.ts` file includes all your migration files.
2. Ensure your database connection settings in `.env` are correct.
3. Look for syntax errors in your migration files.
4. Try running migrations with the `--verbose` flag for more detailed output:
   ```bash
   npm run typeorm -- migration:run --verbose
   ``` 