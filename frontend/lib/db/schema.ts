import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  boolean,
  jsonb,
  doublePrecision,
  numeric,
  bigint,
  date,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const bids = pgTable("bids", {
  id: text("id").primaryKey(),
  bidNtceNo: text("bid_ntce_no").notNull(),
  bidNtceOrd: text("bid_ntce_ord").notNull(),
  bidNtceNm: text("bid_ntce_nm"),
  bidNtceSttus: text("bid_ntce_sttus"),
  bidNtceDate: text("bid_ntce_date"),
  bsnsDivNm: text("bsns_div_nm"),
  ntceInsttNm: text("ntce_instt_nm"),
  assignBdgtAmt: text("assign_bdgt_amt"),
  presmptPrce: text("presmpt_prce"),
  bidClseDate: text("bid_clse_date"),
  bidClseTm: text("bid_clse_tm"),
  bidNtceUrl: text("bid_ntce_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  aiCategory: text("ai_category"),
  dmndInsttNm: text("dmnd_instt_nm"),
  bidprcPsblIndstryNm: text("bidprc_psbl_indstrty_nm"),
  rgnLmtYn: text("rgn_lmt_yn"),
  prtcptPsblRgnNm: text("prtcpt_psbl_rgn_nm"),
  cntrctCnclsMthdNm: text("cntrct_cncls_mthd_nm"),
  bidwinrDcsnMthdNm: text("bidwinr_dcsn_mthd_nm"),
  opengDate: text("openg_date"),
  dmndInsttOfclDeptNm: text("dmnd_instt_ofcl_dept_nm"),
  dmndInsttOfclNm: text("dmnd_instt_ofcl_nm"),
  dmndInsttOfclTel: text("dmnd_instt_ofcl_tel"),
  dmndInsttOfclEmailAdrs: text("dmnd_instt_ofcl_email_adrs"),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
});

export const champions = pgTable("champions", {
  slug: text("slug").primaryKey(),
  name: text("name").notNull(),
  title: text("title").notNull(),
  affiliation: text("affiliation").notNull(),
  bio: text("bio").default("").notNull(),
  yearAwarded: integer("year_awarded"),
  domain: text("domain").array().default(sql`'{}'::text[]`).notNull(),
  grade: text("grade").default("green").notNull(),
  avatarUrl: text("avatar_url"),
  featured: boolean("featured").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const comments = pgTable("comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  contentType: text("content_type").notNull(),
  contentId: text("content_id").notNull(),
  authorName: text("author_name").default("익명").notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const documents = pgTable("documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  content: text("content").notNull(),
  contentHash: text("content_hash"),
  type: text("type").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const guides = pgTable("guides", {
  slug: text("slug").primaryKey(),
  title: text("title").notNull(),
  summary: text("summary").default("").notNull(),
  category: text("category").default("").notNull(),
  tags: text("tags").array().default(sql`'{}'::text[]`).notNull(),
  publishedAt: text("published_at").notNull(),
  body: text("body").notNull(),
  videos: jsonb("videos").default(sql`'[]'::jsonb`).notNull(),
  evaluationScore: doublePrecision("evaluation_score"),
  status: text("status").default("published").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  images: jsonb("images").default(sql`'[]'::jsonb`),
  views: integer("views").default(0),
});

export const insights = pgTable("insights", {
  slug: text("slug").primaryKey(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  sources: jsonb("sources").default(sql`'[]'::jsonb`).notNull(),
  publishedAt: text("published_at").notNull(),
  category: text("category").default("").notNull(),
  imageUrl: text("image_url"),
  evaluationScore: doublePrecision("evaluation_score"),
  crawledCount: integer("crawled_count").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  views: integer("views").default(0),
});

export const likes = pgTable("likes", {
  id: uuid("id").defaultRandom().primaryKey(),
  contentType: text("content_type").notNull(),
  contentId: text("content_id").notNull(),
  userFingerprint: text("user_fingerprint").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const portfolios = pgTable("portfolios", {
  slug: text("slug").primaryKey(),
  title: text("title").notNull(),
  summary: text("summary").default("").notNull(),
  techStack: text("tech_stack").array().default(sql`'{}'::text[]`).notNull(),
  championName: text("champion_name"),
  agency: text("agency").default("").notNull(),
  domain: text("domain").default("").notNull(),
  coverImage: text("cover_image"),
  body: text("body").default("").notNull(),
  publishedAt: text("published_at").notNull(),
  featured: boolean("featured").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const procReports = pgTable("proc_reports", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  data: jsonb("data").notNull(),
  periodStart: text("period_start"),
  periodEnd: text("period_end"),
  baselineStart: text("baseline_start"),
  baselineEnd: text("baseline_end"),
  evaluationScore: numeric("evaluation_score"),
  status: text("status").default("draft"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const procurement = pgTable("procurement", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  agency: text("agency").default("").notNull(),
  budgetKrw: bigint("budget_krw", { mode: "number" }),
  deadline: text("deadline"),
  url: text("url").notNull(),
  category: text("category").default("").notNull(),
  publishedAt: text("published_at").notNull(),
  status: text("status").default("open").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const rawItems = pgTable("raw_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  itemHash: text("item_hash").notNull().unique(),
  sourceId: text("source_id").notNull(),
  title: text("title"),
  url: text("url"),
  body: text("body"),
  collectedAt: date("collected_at"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const seenHashes = pgTable("seen_hashes", {
  hash: text("hash").primaryKey(),
  sourceId: text("source_id").default("").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const subscribers = pgTable("subscribers", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
