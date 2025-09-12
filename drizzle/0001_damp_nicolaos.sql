CREATE SEQUENCE "public"."session_id_seq" INCREMENT BY 1 MINVALUE 1000000 MAXVALUE 9999999 START WITH 1000000 CACHE 1;--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "expires_at > now" CHECK ("sessions"."expires_at" > now())
);
--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "password_hash" TO "password";--> statement-breakpoint
ALTER TABLE "locations" ADD COLUMN "location" geometry(point) NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_logout" timestamp;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "locations_spatial_idx" ON "locations" USING gist ("location");--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "login_valid_till";--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "last login <= now" CHECK ("users"."last_login" <= now());--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "last logout <= now" CHECK ("users"."last_logout" <= now());