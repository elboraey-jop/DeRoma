# Database migrations

The repository now has one baseline migration generated from the current Prisma schema:

`prisma/migrations/20260814175035_init/migration.sql`

## New database

Run migrations with:

```bash
npm run db:migrate:deploy
```

This creates the complete schema, including `Product.slug`.

## Local development

Use:

```bash
npm run db:migrate
```

Do not use `prisma migrate reset` against a database containing real data.

## Existing database created before this baseline

Before connecting a real database that already contains the tables, take a backup and mark this baseline as applied only after verifying that its schema matches the database:

```bash
npx prisma migrate resolve --applied 20260814175035_init
npm run db:migrate:deploy
```

For a database whose schema does not match the baseline, create a separate corrective migration first; never reset it to make migrations pass.
