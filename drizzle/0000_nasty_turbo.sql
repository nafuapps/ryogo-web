CREATE TYPE "public"."agency_status" AS ENUM('new', 'active', 'expired', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."booking_status" AS ENUM('quote', 'confirmed', 'in_progress', 'completed', 'cancelled', 'reconciled');--> statement-breakpoint
CREATE TYPE "public"."booking_type" AS ENUM('OneWay', 'Round', 'MultiDay');--> statement-breakpoint
CREATE TYPE "public"."customer_status" AS ENUM('active', 'inactive', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."driver_status" AS ENUM('available', 'on_trip', 'inactive', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."expense_types" AS ENUM('fuel', 'toll', 'parking', 'maintenance', 'ac', 'food', 'other');--> statement-breakpoint
CREATE TYPE "public"."subscription_plan" AS ENUM('trial', 'premium');--> statement-breakpoint
CREATE TYPE "public"."transaction_modes" AS ENUM('cash', 'card', 'upi', 'other');--> statement-breakpoint
CREATE TYPE "public"."transaction_parties" AS ENUM('driver', 'customer');--> statement-breakpoint
CREATE TYPE "public"."transaction_types" AS ENUM('debit', 'credit');--> statement-breakpoint
CREATE TYPE "public"."trip_log_types" AS ENUM('start_trip', 'end_trip', 'arrived', 'pickup', 'drop');--> statement-breakpoint
CREATE TYPE "public"."user_roles" AS ENUM('agent', 'owner', 'admin', 'driver');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('new', 'inactive', 'active', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."vehicle_status" AS ENUM('available', 'on_trip', 'inactive', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."vehicle_types" AS ENUM('car', 'bike', 'bus', 'other', 'truck');--> statement-breakpoint
CREATE SEQUENCE "public"."agency_id_seq" INCREMENT BY 1 MINVALUE 1000000 MAXVALUE 9999999 START WITH 1000000 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."booking_id_seq" INCREMENT BY 1 MINVALUE 1000000 MAXVALUE 9999999 START WITH 1000000 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."customer_id_seq" INCREMENT BY 1 MINVALUE 1000000 MAXVALUE 9999999 START WITH 1000000 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."driver_id_seq" INCREMENT BY 1 MINVALUE 1000000 MAXVALUE 9999999 START WITH 1000000 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."driverLeave_id_seq" INCREMENT BY 1 MINVALUE 1000000 MAXVALUE 9999999 START WITH 1000000 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."expense_id_seq" INCREMENT BY 1 MINVALUE 1000000 MAXVALUE 9999999 START WITH 1000000 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."location_id_seq" INCREMENT BY 1 MINVALUE 1000000 MAXVALUE 9999999 START WITH 1000000 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."route_id_seq" INCREMENT BY 1 MINVALUE 1000000 MAXVALUE 9999999 START WITH 1000000 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."transaction_id_seq" INCREMENT BY 1 MINVALUE 1000000 MAXVALUE 9999999 START WITH 1000000 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."trip_log_id_seq" INCREMENT BY 1 MINVALUE 1000000 MAXVALUE 9999999 START WITH 1000000 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."user_id_seq" INCREMENT BY 1 MINVALUE 1000000 MAXVALUE 9999999 START WITH 1000000 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."vehicle_id_seq" INCREMENT BY 1 MINVALUE 1000000 MAXVALUE 9999999 START WITH 1000000 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."vehicle_service_id_seq" INCREMENT BY 1 MINVALUE 1000000 MAXVALUE 9999999 START WITH 1000000 CACHE 1;--> statement-breakpoint
CREATE TABLE "agencies" (
	"id" text PRIMARY KEY NOT NULL,
	"business_name" varchar(30) NOT NULL,
	"business_phone" varchar(10) NOT NULL,
	"business_email" varchar(60) NOT NULL,
	"business_address" text NOT NULL,
	"logo_url" text,
	"subscriptionPlan" "subscription_plan" DEFAULT 'trial' NOT NULL,
	"subscription_expires_on" timestamp NOT NULL,
	"status" "agency_status" DEFAULT 'new' NOT NULL,
	"default_commission_rate" integer DEFAULT 15 NOT NULL,
	"location_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "commission_rate >= 0 AND commission_rate <= 100" CHECK ("agencies"."default_commission_rate" >= 0 AND "agencies"."default_commission_rate" <= 100)
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" text PRIMARY KEY NOT NULL,
	"agency_id" text NOT NULL,
	"customer_id" text NOT NULL,
	"assigned_vehicle_id" text,
	"assigned_driver_id" text,
	"booked_by_user_id" text NOT NULL,
	"assigned_user_id" text NOT NULL,
	"source_id" text NOT NULL,
	"destination_id" text NOT NULL,
	"route_id" text,
	"total_distance" integer,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"start_time" time,
	"type" "booking_type" DEFAULT 'OneWay' NOT NULL,
	"passengers" integer DEFAULT 1 NOT NULL,
	"needs_ac" boolean DEFAULT true NOT NULL,
	"remarks" text,
	"rate_per_km" integer NOT NULL,
	"allowance_per_day" integer NOT NULL,
	"commission_rate" integer NOT NULL,
	"total_amount" integer NOT NULL,
	"rating_by_driver" integer,
	"status" "booking_status" DEFAULT 'quote' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "commission_rate >= 0 AND commission_rate <= 100" CHECK ("bookings"."commission_rate" >= 0 AND "bookings"."commission_rate" <= 100),
	CONSTRAINT "passengers > 0 and < 100" CHECK ("bookings"."passengers" > 0 AND "bookings"."passengers" < 100),
	CONSTRAINT "rate per km > 0 and < 50" CHECK ("bookings"."rate_per_km" > 0 AND "bookings"."rate_per_km" < 50),
	CONSTRAINT "allowance >= 0 and allowance < 10000" CHECK ("bookings"."allowance_per_day" >= 0 AND "bookings"."allowance_per_day" < 10000),
	CONSTRAINT "end_date >= start_date" CHECK ("bookings"."end_date" >= "bookings"."start_date"),
	CONSTRAINT "total_amount > 0 and < 1000000" CHECK ("bookings"."total_amount" > 0 AND "bookings"."total_amount" < 1000000),
	CONSTRAINT "rating >=1 and rating <=5" CHECK ("bookings"."rating_by_driver" >=1 AND "bookings"."rating_by_driver" <=5)
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" text PRIMARY KEY NOT NULL,
	"agency_id" text NOT NULL,
	"name" varchar(30) NOT NULL,
	"phone" varchar(10) NOT NULL,
	"email" varchar(60),
	"address" text,
	"added_by_user_id" text NOT NULL,
	"location_id" text NOT NULL,
	"status" "customer_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "customers_phone_agency_id_unique" UNIQUE("phone","agency_id")
);
--> statement-breakpoint
CREATE TABLE "driver_leaves" (
	"id" text PRIMARY KEY NOT NULL,
	"agency_id" text NOT NULL,
	"driver_id" text NOT NULL,
	"added_by_user_id" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"remarks" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "end_date >= start_date" CHECK ("driver_leaves"."end_date" >= "driver_leaves"."start_date")
);
--> statement-breakpoint
CREATE TABLE "drivers" (
	"id" text PRIMARY KEY NOT NULL,
	"agency_id" text NOT NULL,
	"user_id" text NOT NULL,
	"name" varchar(30) NOT NULL,
	"phone" varchar(10) NOT NULL,
	"address" text NOT NULL,
	"license_number" varchar(20) NOT NULL,
	"license_expires_on" timestamp NOT NULL,
	"status" "driver_status" DEFAULT 'available' NOT NULL,
	"canDriveVehicleTypes" "vehicle_types"[] DEFAULT '{"car"}' NOT NULL,
	"default_allowance_per_day" integer DEFAULT 500 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "drivers_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "drivers_phone_agency_id_unique" UNIQUE("phone","agency_id"),
	CONSTRAINT "allowance >=0 and < 10000" CHECK ("drivers"."default_allowance_per_day" >=0 AND "drivers"."default_allowance_per_day" < 10000)
);
--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" text PRIMARY KEY NOT NULL,
	"agency_id" text NOT NULL,
	"booking_id" text,
	"added_by_user_id" text NOT NULL,
	"type" "expense_types" NOT NULL,
	"amount" integer NOT NULL,
	"remarks" text,
	"photo_url" text,
	"is_approved" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "amount > 0 and < 1000000" CHECK ("expenses"."amount" > 0 AND "expenses"."amount" < 1000000)
);
--> statement-breakpoint
CREATE TABLE "locations" (
	"id" text PRIMARY KEY NOT NULL,
	"city" varchar(30) NOT NULL,
	"state" varchar(30) NOT NULL,
	"lat_long" varchar(50),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "locations_city_state_unique" UNIQUE("city","state")
);
--> statement-breakpoint
CREATE TABLE "routes" (
	"id" text PRIMARY KEY NOT NULL,
	"source_id" text NOT NULL,
	"destination_id" text NOT NULL,
	"distance" integer NOT NULL,
	"estimated_time" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "routes_source_id_destination_id_unique" UNIQUE("source_id","destination_id"),
	CONSTRAINT "distance > 0 and < 5000" CHECK ("routes"."distance" > 0 AND "routes"."distance" < 5000),
	CONSTRAINT "time > 0 and < 10000" CHECK ("routes"."estimated_time" > 0 AND "routes"."estimated_time" < 10000)
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"agency_id" text NOT NULL,
	"booking_id" text,
	"added_by_user_id" text,
	"amount" integer NOT NULL,
	"otherParty" "transaction_parties" DEFAULT 'customer' NOT NULL,
	"type" "transaction_types" NOT NULL,
	"mode" "transaction_modes" DEFAULT 'cash' NOT NULL,
	"remarks" text,
	"is_approved" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "amount > 0 and < 1000000" CHECK ("transactions"."amount" > 0 AND "transactions"."amount" < 1000000)
);
--> statement-breakpoint
CREATE TABLE "trip_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"booking_id" text NOT NULL,
	"agency_id" text NOT NULL,
	"vehicle_id" text NOT NULL,
	"driver_id" text NOT NULL,
	"odometer_reading" integer NOT NULL,
	"type" "trip_log_types" NOT NULL,
	"remarks" text,
	"photo_url" text,
	"lat_long" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "odometer >= 0 and < 1000000" CHECK ("trip_logs"."odometer_reading" >= 0 AND "trip_logs"."odometer_reading" < 1000000)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"agency_id" text NOT NULL,
	"name" varchar(30) NOT NULL,
	"phone" varchar(10) NOT NULL,
	"email" varchar(60) NOT NULL,
	"password_hash" text NOT NULL,
	"photo_url" text,
	"userRole" "user_roles" DEFAULT 'agent' NOT NULL,
	"status" "agency_status" DEFAULT 'new' NOT NULL,
	"last_login" timestamp,
	"login_valid_till" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "users_agency_id_phone_userRole_unique" UNIQUE("agency_id","phone","userRole")
);
--> statement-breakpoint
CREATE TABLE "vehicle_services" (
	"id" text PRIMARY KEY NOT NULL,
	"agency_id" text NOT NULL,
	"vehicle_id" text NOT NULL,
	"added_by_user_id" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"remarks" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "end_date >= start_date" CHECK ("vehicle_services"."end_date" >= "vehicle_services"."start_date")
);
--> statement-breakpoint
CREATE TABLE "vehicles" (
	"id" text PRIMARY KEY NOT NULL,
	"agency_id" text NOT NULL,
	"vehicle_number" varchar(15) NOT NULL,
	"brand" varchar(30) NOT NULL,
	"model" varchar(30) NOT NULL,
	"color" varchar(20) NOT NULL,
	"insurance_expires_on" timestamp,
	"puc_expires_on" timestamp,
	"odometer_reading" integer NOT NULL,
	"capacity" integer DEFAULT 4 NOT NULL,
	"has_ac" boolean NOT NULL,
	"type" "vehicle_types" DEFAULT 'car' NOT NULL,
	"status" "vehicle_status" DEFAULT 'available' NOT NULL,
	"doc_url" text[],
	"default_rate_per_km" integer DEFAULT 18 NOT NULL,
	"extra_ac_charge_per_day" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "vehicles_vehicle_number_agency_id_unique" UNIQUE("vehicle_number","agency_id"),
	CONSTRAINT "capacity > 0 and < 100" CHECK ("vehicles"."capacity" > 0 AND "vehicles"."capacity" < 100),
	CONSTRAINT "odometer >= 0 and < 1000000" CHECK ("vehicles"."odometer_reading" >= 0 AND "vehicles"."odometer_reading" < 1000000),
	CONSTRAINT "rate per km > 0 and < 50" CHECK ("vehicles"."default_rate_per_km" > 0 AND "vehicles"."default_rate_per_km" < 50),
	CONSTRAINT "ac charge < 10000" CHECK ("vehicles"."extra_ac_charge_per_day" < 10000)
);
--> statement-breakpoint
ALTER TABLE "agencies" ADD CONSTRAINT "agencies_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_agency_id_agencies_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_assigned_vehicle_id_vehicles_id_fk" FOREIGN KEY ("assigned_vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_assigned_driver_id_drivers_id_fk" FOREIGN KEY ("assigned_driver_id") REFERENCES "public"."drivers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_booked_by_user_id_users_id_fk" FOREIGN KEY ("booked_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_assigned_user_id_users_id_fk" FOREIGN KEY ("assigned_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_source_id_locations_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."locations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_destination_id_locations_id_fk" FOREIGN KEY ("destination_id") REFERENCES "public"."locations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_route_id_routes_id_fk" FOREIGN KEY ("route_id") REFERENCES "public"."routes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_agency_id_agencies_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_added_by_user_id_users_id_fk" FOREIGN KEY ("added_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "driver_leaves" ADD CONSTRAINT "driver_leaves_agency_id_agencies_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "driver_leaves" ADD CONSTRAINT "driver_leaves_driver_id_drivers_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."drivers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "driver_leaves" ADD CONSTRAINT "driver_leaves_added_by_user_id_users_id_fk" FOREIGN KEY ("added_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_agency_id_agencies_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_agency_id_agencies_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_added_by_user_id_users_id_fk" FOREIGN KEY ("added_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routes" ADD CONSTRAINT "routes_source_id_locations_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routes" ADD CONSTRAINT "routes_destination_id_locations_id_fk" FOREIGN KEY ("destination_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_agency_id_agencies_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_added_by_user_id_users_id_fk" FOREIGN KEY ("added_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_logs" ADD CONSTRAINT "trip_logs_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_logs" ADD CONSTRAINT "trip_logs_agency_id_agencies_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_logs" ADD CONSTRAINT "trip_logs_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_logs" ADD CONSTRAINT "trip_logs_driver_id_drivers_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."drivers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_agency_id_agencies_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_services" ADD CONSTRAINT "vehicle_services_agency_id_agencies_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_services" ADD CONSTRAINT "vehicle_services_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_services" ADD CONSTRAINT "vehicle_services_added_by_user_id_users_id_fk" FOREIGN KEY ("added_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_agency_id_agencies_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "agencies_subscription_expiry_idx" ON "agencies" USING btree ("subscription_expires_on");--> statement-breakpoint
CREATE INDEX "agencies_status_idx" ON "agencies" USING btree ("status");--> statement-breakpoint
CREATE INDEX "agencies_location_idx" ON "agencies" USING btree ("location_id");--> statement-breakpoint
CREATE INDEX "bookings_agency_idx" ON "bookings" USING btree ("agency_id");--> statement-breakpoint
CREATE INDEX "bookings_agency_status_idx" ON "bookings" USING btree ("status","agency_id");--> statement-breakpoint
CREATE INDEX "bookings_agency_customer_idx" ON "bookings" USING btree ("customer_id","agency_id");--> statement-breakpoint
CREATE INDEX "bookings_agency_assigned_user_idx" ON "bookings" USING btree ("assigned_user_id","agency_id");--> statement-breakpoint
CREATE INDEX "bookings_agency_booked_by_user_idx" ON "bookings" USING btree ("booked_by_user_id","agency_id");--> statement-breakpoint
CREATE INDEX "bookings_agency_driver_idx" ON "bookings" USING btree ("assigned_driver_id","agency_id");--> statement-breakpoint
CREATE INDEX "bookings_agency_vehicle_idx" ON "bookings" USING btree ("assigned_vehicle_id","agency_id");--> statement-breakpoint
CREATE INDEX "bookings_agency_start_date_idx" ON "bookings" USING btree ("start_date","agency_id");--> statement-breakpoint
CREATE INDEX "bookings_agency_end_date_idx" ON "bookings" USING btree ("end_date","agency_id");--> statement-breakpoint
CREATE INDEX "bookings_agency_source_idx" ON "bookings" USING btree ("source_id","agency_id");--> statement-breakpoint
CREATE INDEX "bookings_agency_destination_idx" ON "bookings" USING btree ("destination_id","agency_id");--> statement-breakpoint
CREATE INDEX "bookings_agency_route_idx" ON "bookings" USING btree ("route_id","agency_id");--> statement-breakpoint
CREATE INDEX "bookings_agency_type_idx" ON "bookings" USING btree ("type","agency_id");--> statement-breakpoint
CREATE UNIQUE INDEX "customers_agency_phone_idx" ON "customers" USING btree ("phone","agency_id");--> statement-breakpoint
CREATE INDEX "customers_agency_idx" ON "customers" USING btree ("agency_id");--> statement-breakpoint
CREATE INDEX "customers_agency_user_idx" ON "customers" USING btree ("added_by_user_id","agency_id");--> statement-breakpoint
CREATE INDEX "customers_agency_status_idx" ON "customers" USING btree ("status","agency_id");--> statement-breakpoint
CREATE INDEX "customers_agency_location_idx" ON "customers" USING btree ("location_id","agency_id");--> statement-breakpoint
CREATE INDEX "customers_phone_idx" ON "customers" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "driver_leaves_agency_driver_idx" ON "driver_leaves" USING btree ("driver_id","agency_id");--> statement-breakpoint
CREATE INDEX "driver_leaves_agency_user_idx" ON "driver_leaves" USING btree ("added_by_user_id","agency_id");--> statement-breakpoint
CREATE INDEX "driver_leaves_agency_start_date_idx" ON "driver_leaves" USING btree ("start_date","agency_id");--> statement-breakpoint
CREATE INDEX "driver_leaves_agency_end_date_idx" ON "driver_leaves" USING btree ("end_date","agency_id");--> statement-breakpoint
CREATE UNIQUE INDEX "drivers_agency_phone_idx" ON "drivers" USING btree ("phone","agency_id");--> statement-breakpoint
CREATE UNIQUE INDEX "drivers_user_idx" ON "drivers" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "drivers_agency_idx" ON "drivers" USING btree ("agency_id");--> statement-breakpoint
CREATE INDEX "drivers_agency_status_idx" ON "drivers" USING btree ("status","agency_id");--> statement-breakpoint
CREATE INDEX "drivers_agency_drive_type_idx" ON "drivers" USING btree ("canDriveVehicleTypes","agency_id");--> statement-breakpoint
CREATE INDEX "expenses_booking_idx" ON "expenses" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "expenses_booking_type_idx" ON "expenses" USING btree ("type","booking_id");--> statement-breakpoint
CREATE INDEX "expenses_booking_approved_idx" ON "expenses" USING btree ("is_approved","booking_id");--> statement-breakpoint
CREATE INDEX "expenses_agency_user_idx" ON "expenses" USING btree ("added_by_user_id","agency_id");--> statement-breakpoint
CREATE UNIQUE INDEX "locations_city_state_idx" ON "locations" USING btree ("city","state");--> statement-breakpoint
CREATE INDEX "locations_active_idx" ON "locations" USING btree ("is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "routes_source_destination_idx" ON "routes" USING btree ("source_id","destination_id");--> statement-breakpoint
CREATE INDEX "routes_source_idx" ON "routes" USING btree ("source_id");--> statement-breakpoint
CREATE INDEX "routes_destination_idx" ON "routes" USING btree ("destination_id");--> statement-breakpoint
CREATE INDEX "routes_active_idx" ON "routes" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "transactions_booking_idx" ON "transactions" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "transactions_booking_type_idx" ON "transactions" USING btree ("type","booking_id");--> statement-breakpoint
CREATE INDEX "transactions_booking_party_idx" ON "transactions" USING btree ("otherParty","booking_id");--> statement-breakpoint
CREATE INDEX "transactions_booking_approved_idx" ON "transactions" USING btree ("is_approved","booking_id");--> statement-breakpoint
CREATE INDEX "transactions_agency_user_idx" ON "transactions" USING btree ("added_by_user_id","agency_id");--> statement-breakpoint
CREATE INDEX "trip_logs_booking_idx" ON "trip_logs" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "trip_logs_booking_type_idx" ON "trip_logs" USING btree ("type","booking_id");--> statement-breakpoint
CREATE INDEX "trip_logs_agency_vehicle_idx" ON "trip_logs" USING btree ("vehicle_id","agency_id");--> statement-breakpoint
CREATE INDEX "trip_logs_agency_driver_idx" ON "trip_logs" USING btree ("driver_id","agency_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_agency_role_phone_idx" ON "users" USING btree ("agency_id","phone","userRole");--> statement-breakpoint
CREATE INDEX "users_agency_idx" ON "users" USING btree ("agency_id");--> statement-breakpoint
CREATE INDEX "users_agency_phone_idx" ON "users" USING btree ("phone","agency_id");--> statement-breakpoint
CREATE INDEX "users_agency_role_idx" ON "users" USING btree ("userRole","agency_id");--> statement-breakpoint
CREATE INDEX "users_agency_status_idx" ON "users" USING btree ("status","agency_id");--> statement-breakpoint
CREATE INDEX "vehicle_services_agency_vehicle_idx" ON "vehicle_services" USING btree ("vehicle_id","agency_id");--> statement-breakpoint
CREATE INDEX "vehicle_services_agency_user_idx" ON "vehicle_services" USING btree ("added_by_user_id","agency_id");--> statement-breakpoint
CREATE INDEX "vehicle_services_agency_start_date_idx" ON "vehicle_services" USING btree ("start_date","agency_id");--> statement-breakpoint
CREATE INDEX "vehicle_services_agency_end_date_idx" ON "vehicle_services" USING btree ("end_date","agency_id");--> statement-breakpoint
CREATE UNIQUE INDEX "vehicles_agency_vehicle_number_idx" ON "vehicles" USING btree ("vehicle_number","agency_id");--> statement-breakpoint
CREATE INDEX "vehicles_agency_idx" ON "vehicles" USING btree ("agency_id");--> statement-breakpoint
CREATE INDEX "vehicles_agency_status_idx" ON "vehicles" USING btree ("status","agency_id");--> statement-breakpoint
CREATE INDEX "vehicles_agency_type_idx" ON "vehicles" USING btree ("type","agency_id");--> statement-breakpoint
CREATE INDEX "vehicles_agency_capacity_idx" ON "vehicles" USING btree ("capacity","agency_id");--> statement-breakpoint
CREATE INDEX "vehicles_agency_ac_idx" ON "vehicles" USING btree ("has_ac","agency_id");