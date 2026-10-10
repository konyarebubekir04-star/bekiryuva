import { pgTable, uuid, text, timestamp, jsonb, pgPolicy, check, unique, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().notNull(),
  displayName: text("display_name").default("").notNull(),
  avatarUrl: text("avatar_url"),
  preferences: jsonb("preferences").default({}).notNull(),
});

export const families = pgTable("families", {
  id: uuid("id").primaryKey().defaultRandom(),
  childName: text("child_name").notNull(),
  createdBy: uuid("created_by").notNull(),
  inviteCode: uuid("invite_code").defaultRandom().notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const userRoles = pgTable("user_roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  familyId: uuid("family_id").notNull().references(() => families.id, { onDelete: 'cascade' }),
  userId: uuid("user_id").notNull(),
  parentRole: text("parent_role").notNull(), // 'anne', 'baba'
  access: text("access").default("viewer").notNull(), // 'editor', 'viewer'
  displayName: text("display_name").default("").notNull(),
}, (table) => [
  check("parent_role_check", sql`${table.parentRole} IN ('anne', 'baba')`),
  check("access_check", sql`${table.access} IN ('editor', 'viewer')`),
  unique("family_user_unique").on(table.familyId, table.userId),
]);

export const familyRecords = pgTable("family_records", {
  id: uuid("id").primaryKey().defaultRandom(),
  familyId: uuid("family_id").notNull().references(() => families.id, { onDelete: 'cascade' }),
  authorId: uuid("author_id").default(sql`auth.uid()`).notNull(),
  kind: text("kind").notNull(),
  payload: jsonb("payload").default({}).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  check("kind_check", sql`${table.kind} IN ('event', 'task', 'health', 'message', 'note', 'status', 'screen')`),
  index("records_family_idx").on(table.familyId, table.createdAt),
]);
