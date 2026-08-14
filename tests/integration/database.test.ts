import assert from "node:assert/strict";
import test from "node:test";
import { checkDatabaseConnection } from "../../src/lib/prisma";

test("database is reachable with the configured Prisma connection", async () => {
  assert.equal(await checkDatabaseConnection(), true);
});
