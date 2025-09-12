import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  index,
  integer,
  pgEnum,
  pgSequence,
  pgTable,
  text,
  time,
  timestamp,
  unique,
  uniqueIndex,
  varchar,
  geometry,
} from "drizzle-orm/pg-core";

//Common timestamps
const timestamps = {
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
};

//Common Sequence values
const sequenceValues = {
  startWith: 1000000,
  maxValue: 9999999,
  minValue: 1000000,
  increment: 1,
};

//Agencies table
export const agencyStatus = pgEnum("agency_status", [
  "new",
  "active",
  "expired",
  "suspended",
]);
export const subscriptionPlan = pgEnum("subscription_plan", [
  "trial",
  "premium",
]);
export const agencyIdSequence = pgSequence("agency_id_seq", {
  ...sequenceValues,
});
export const agencies = pgTable(
  "agencies",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => {
        return sql`'A' || nextval(${"agency_id_seq"})`;
      }),
    businessName: varchar("business_name", { length: 30 }).notNull(),
    businessPhone: varchar("business_phone", { length: 10 }).notNull(),
    businessEmail: varchar("business_email", { length: 60 }).notNull(),
    businessAddress: text("business_address").notNull(),
    logoUrl: text("logo_url"),
    subscriptionPlan: subscriptionPlan().notNull().default("trial"),
    subscriptionExpiresOn: timestamp("subscription_expires_on").notNull(),
    status: agencyStatus().notNull().default("new"),
    defaultCommissionRate: integer("default_commission_rate")
      .notNull()
      .default(15), // percentage
    locationId: text("location_id")
      .references(() => locations.id, { onDelete: "set null" })
      .notNull(),
    ...timestamps,
  },
  (t) => [
    check(
      "commission_rate >= 0 AND commission_rate <= 100",
      sql`${t.defaultCommissionRate} >= 0 AND ${t.defaultCommissionRate} <= 100`
    ),
    index("agencies_subscription_expiry_idx").on(t.subscriptionExpiresOn), // to quickly find agencies with expired subscriptions
    index("agencies_status_idx").on(t.status), // to quickly filter agencies by status
    index("agencies_location_idx").on(t.locationId), // to quickly filter agencies by location
  ]
);
export const agenciesRelations = relations(agencies, ({ many, one }) => ({
  locations: one(locations, {
    fields: [agencies.locationId],
    references: [locations.id],
  }),
  users: many(users),
  vehicles: many(vehicles),
  drivers: many(drivers),
  customers: many(customers),
  bookings: many(bookings),
  expenses: many(expenses),
  transactions: many(transactions),
  vehicleServices: many(vehicleServices),
  driverLeaves: many(driverLeaves),
  tripLogs: many(tripLogs),
}));

//Users table
export const userRoles = pgEnum("user_roles", [
  "agent",
  "owner",
  "admin",
  "driver",
]);
export const userStatus = pgEnum("user_status", [
  "new",
  "inactive",
  "active",
  "suspended",
]);
export const userIdSequence = pgSequence("user_id_seq", {
  ...sequenceValues,
});
export const users = pgTable(
  "users",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => {
        return sql`'U' || nextval(${"user_id_seq"})`;
      }),
    agencyId: text("agency_id")
      .references(() => agencies.id, { onDelete: "cascade" })
      .notNull(),
    name: varchar("name", { length: 30 }).notNull(),
    phone: varchar("phone", { length: 10 }).notNull(),
    email: varchar("email", { length: 60 }).notNull(),
    password: text("password").notNull(),
    photoUrl: text("photo_url"),
    userRole: userRoles().notNull().default("agent"),
    status: agencyStatus().notNull().default("new"),
    lastLogin: timestamp("last_login"),
    lastLogout: timestamp("last_logout"),
    ...timestamps,
  },
  (t) => [
    unique().on(t.agencyId, t.phone, t.userRole), //Owner or Agent can also be a driver
    check("last login <= now", sql`${t.lastLogin} <= now()`),
    check("last logout <= now", sql`${t.lastLogout} <= now()`),
    uniqueIndex("users_agency_role_phone_idx").on(
      t.agencyId,
      t.phone,
      t.userRole
    ), // to quickly find unique user with phone number & role in an agency
    index("users_agency_idx").on(t.agencyId), // to quickly filter all users in an agency
    index("users_agency_phone_idx").on(t.phone, t.agencyId), // to quickly filter users by phone number in an agency
    index("users_agency_role_idx").on(t.userRole, t.agencyId), // to quickly filter users by role in an agency
    index("users_agency_status_idx").on(t.status, t.agencyId), // to quickly filter users by status in an agency
  ]
);
export const usersRelations = relations(users, ({ one, many }) => ({
  agency: one(agencies, {
    fields: [users.agencyId],
    references: [agencies.id],
  }),
  driver: one(drivers),
  bookingsAssigned: many(bookings, {
    relationName: "bookings_assigned_user_fkey",
  }),
  bookingsBooked: many(bookings, {
    relationName: "bookings_booked_by_user_fkey",
  }),
  expensesAdded: many(expenses),
  transactionsAdded: many(transactions),
  vehicleServicesAdded: many(vehicleServices),
  driverLeavesAdded: many(driverLeaves),
  customersAdded: many(customers),
  sessions: many(sessions),
}));

//Sessions table
export const sessionIdSequence = pgSequence("session_id_seq", {
  ...sequenceValues,
});
export const sessions = pgTable(
  "sessions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => {
        return sql`'S' || nextval(${"session_id_seq"})`;
      }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at").notNull(),
    ...timestamps,
  },
  (t) => [
    check("expires_at > now", sql`${t.expiresAt} > now()`),
    index("sessions_user_idx").on(t.userId), // to quickly filter sessions by user
  ]
);
export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

//Vehicles table
export const vehicleTypes = pgEnum("vehicle_types", [
  "car",
  "bike",
  "bus",
  "other",
  "truck",
]);
export const vehicleStatus = pgEnum("vehicle_status", [
  "available",
  "on_trip",
  "inactive",
  "suspended",
]);
export const vehicleIdSequence = pgSequence("vehicle_id_seq", {
  ...sequenceValues,
});
export const vehicles = pgTable(
  "vehicles",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => {
        return sql`'V' || nextval(${"vehicle_id_seq"})`;
      }),
    agencyId: text("agency_id")
      .references(() => agencies.id, { onDelete: "cascade" })
      .notNull(),
    vehicleNumber: varchar("vehicle_number", { length: 15 }).notNull(),
    brand: varchar("brand", { length: 30 }).notNull(),
    model: varchar("model", { length: 30 }).notNull(),
    color: varchar("color", { length: 20 }).notNull(),
    insuranceExpiresOn: timestamp("insurance_expires_on"),
    pucExpiresOn: timestamp("puc_expires_on"),
    odometerReading: integer("odometer_reading").notNull(), // in kilometers
    capacity: integer("capacity").notNull().default(4), //number of seats
    hasAC: boolean("has_ac").notNull(),
    type: vehicleTypes().notNull().default("car"),
    status: vehicleStatus().notNull().default("available"),
    docUrl: text("doc_url").array(), //multiple docs
    defaultRatePerKm: integer("default_rate_per_km").notNull().default(18), // in currency units
    extraAcChargePerDay: integer("extra_ac_charge_per_day")
      .notNull()
      .default(0), // in currency units
    ...timestamps,
  },
  (t) => [
    unique().on(t.vehicleNumber, t.agencyId), //same vehicle can be added to different agencies
    check(
      "capacity > 0 and < 100",
      sql`${t.capacity} > 0 AND ${t.capacity} < 100`
    ),
    check(
      "odometer >= 0 and < 1000000",
      sql`${t.odometerReading} >= 0 AND ${t.odometerReading} < 1000000`
    ),
    check(
      "rate per km > 0 and < 50",
      sql`${t.defaultRatePerKm} > 0 AND ${t.defaultRatePerKm} < 50`
    ),
    check("ac charge < 10000", sql`${t.extraAcChargePerDay} < 10000`),
    uniqueIndex("vehicles_agency_vehicle_number_idx").on(
      t.vehicleNumber,
      t.agencyId
    ), // to quickly find unique vehicle by vehicle number in an agency
    index("vehicles_agency_idx").on(t.agencyId), // to quickly filter all vehicles in an agency
    index("vehicles_agency_status_idx").on(t.status, t.agencyId), // to quickly filter vehicles by status in an agency
    index("vehicles_agency_type_idx").on(t.type, t.agencyId), // to quickly filter vehicles by type in an agency
    index("vehicles_agency_capacity_idx").on(t.capacity, t.agencyId), // to quickly filter vehicles by capacity in an agency
    index("vehicles_agency_ac_idx").on(t.hasAC, t.agencyId), // to quickly filter vehicles by ac in an agency
  ]
);
export const vehiclesRelations = relations(vehicles, ({ one, many }) => ({
  agency: one(agencies, {
    fields: [vehicles.agencyId],
    references: [agencies.id],
  }),
  assignedBookings: many(bookings),
  vehicleServices: many(vehicleServices),
  tripLogs: many(tripLogs),
}));

//Drivers table
export const driverStatus = pgEnum("driver_status", [
  "available",
  "on_trip",
  "inactive",
  "suspended",
]);
export const driverIdSequence = pgSequence("driver_id_seq", {
  ...sequenceValues,
});
export const drivers = pgTable(
  "drivers",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => {
        return sql`'D' || nextval(${"driver_id_seq"})`;
      }),
    agencyId: text("agency_id")
      .references(() => agencies.id, { onDelete: "cascade" })
      .notNull(),
    userId: text("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull()
      .unique(),
    name: varchar("name", { length: 30 }).notNull(),
    phone: varchar("phone", { length: 10 }).notNull(),
    address: text("address").notNull(),
    licenseNumber: varchar("license_number", { length: 20 }).notNull(),
    licenseExpiresOn: timestamp("license_expires_on").notNull(),
    status: driverStatus().notNull().default("available"),
    canDriveVehicleTypes: vehicleTypes().array().notNull().default(["car"]),
    defaultAllowancePerDay: integer("default_allowance_per_day")
      .notNull()
      .default(500), // in currency units
    ...timestamps,
  },
  (t) => [
    unique().on(t.phone, t.agencyId), //same driver can be added to different agencies
    check(
      "allowance >=0 and < 10000",
      sql`${t.defaultAllowancePerDay} >=0 AND ${t.defaultAllowancePerDay} < 10000`
    ),
    uniqueIndex("drivers_agency_phone_idx").on(t.phone, t.agencyId), // to quickly find unique driver by phone number in an agency
    uniqueIndex("drivers_user_idx").on(t.userId), // to quickly find unique driver by userId
    index("drivers_agency_idx").on(t.agencyId), // to quickly filter all drivers in an agency
    index("drivers_agency_status_idx").on(t.status, t.agencyId), // to quickly filter drivers by status in an agency
    index("drivers_agency_drive_type_idx").on(
      t.canDriveVehicleTypes,
      t.agencyId
    ), // to quickly filter drivers by vehicle types in an agency
  ]
);
export const driverRelations = relations(drivers, ({ one, many }) => ({
  agency: one(agencies, {
    fields: [drivers.agencyId],
    references: [agencies.id],
  }),
  user: one(users, { fields: [drivers.userId], references: [users.id] }),
  assignedBookings: many(bookings),
  driverLeaves: many(driverLeaves),
  tripLogs: many(tripLogs),
}));

//Routes table
export const routeIdSequence = pgSequence("route_id_seq", {
  ...sequenceValues,
});
export const routes = pgTable(
  "routes",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => {
        return sql`'R' || nextval(${"route_id_seq"})`;
      }),
    sourceId: text("source_id")
      .references(() => locations.id, { onDelete: "cascade" })
      .notNull(),
    destinationId: text("destination_id")
      .references(() => locations.id, { onDelete: "cascade" })
      .notNull(),
    distance: integer("distance").notNull(), // in kilometers
    estimatedTime: integer("estimated_time"), // in minutes
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps,
  },
  (t) => [
    check(
      "distance > 0 and < 5000",
      sql`${t.distance} > 0 AND ${t.distance} < 5000`
    ),
    check(
      "time > 0 and < 10000",
      sql`${t.estimatedTime} > 0 AND ${t.estimatedTime} < 10000`
    ),
    unique().on(t.sourceId, t.destinationId), //same route can be added in reverse direction but not in the same direction
    uniqueIndex("routes_source_destination_idx").on(
      t.sourceId,
      t.destinationId
    ), // to quickly find unique route by source and destination
    index("routes_source_idx").on(t.sourceId), // to quickly filter routes by source
    index("routes_destination_idx").on(t.destinationId), // to quickly filter routes by destination
    index("routes_active_idx").on(t.isActive), // to quickly filter active/inactive routes
  ]
);
export const routeRelations = relations(routes, ({ one, many }) => ({
  source: one(locations, {
    fields: [routes.sourceId],
    references: [locations.id],
    relationName: "route_source_fkey",
  }),
  destination: one(locations, {
    fields: [routes.destinationId],
    references: [locations.id],
    relationName: "route_destination_fkey",
  }),
  bookings: many(bookings),
}));

//Customers table
export const customerStatus = pgEnum("customer_status", [
  "active",
  "inactive",
  "suspended",
]);
export const customerIdSequence = pgSequence("customer_id_seq", {
  ...sequenceValues,
});
export const customers = pgTable(
  "customers",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => {
        return sql`'C' || nextval(${"customer_id_seq"})`;
      }),
    agencyId: text("agency_id")
      .references(() => agencies.id, { onDelete: "cascade" })
      .notNull(),
    name: varchar("name", { length: 30 }).notNull(),
    phone: varchar("phone", { length: 10 }).notNull(),
    email: varchar("email", { length: 60 }),
    address: text("address"),
    addedByUserId: text("added_by_user_id")
      .references(() => users.id, { onDelete: "set null" })
      .notNull(),
    locationId: text("location_id")
      .references(() => locations.id, { onDelete: "set null" })
      .notNull(),
    status: customerStatus().notNull().default("active"),
    ...timestamps,
  },
  (t) => [
    unique().on(t.phone, t.agencyId), //same customer can be added to different agencies
    uniqueIndex("customers_agency_phone_idx").on(t.phone, t.agencyId), // to quickly find unique customer by phone number in an agency
    index("customers_agency_idx").on(t.agencyId), // to quickly filter all customers in an agency
    index("customers_agency_user_idx").on(t.addedByUserId, t.agencyId), // to quickly filter customers added by a user in an agency
    index("customers_agency_status_idx").on(t.status, t.agencyId), // to quickly filter customers by status in an agency
    index("customers_agency_location_idx").on(t.locationId, t.agencyId), // to quickly filter customers by location in an agency
    index("customers_phone_idx").on(t.phone), // to quickly filter customers by phone number across agencies (quick search in a new booking)
  ]
);
export const customerRelations = relations(customers, ({ one, many }) => ({
  agency: one(agencies, {
    fields: [customers.agencyId],
    references: [agencies.id],
  }),
  location: one(locations, {
    fields: [customers.locationId],
    references: [locations.id],
  }),
  addedByUser: one(users, {
    fields: [customers.addedByUserId],
    references: [users.id],
  }),
  bookings: many(bookings),
}));

//Bookings table
export const bookingStatus = pgEnum("booking_status", [
  "quote",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
  "reconciled",
]);
export const bookingType = pgEnum("booking_type", [
  "OneWay",
  "Round",
  "MultiDay",
]);
export const bookingIdSequence = pgSequence("booking_id_seq", {
  ...sequenceValues,
});
export const bookings = pgTable(
  "bookings",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => {
        return sql`'B' || nextval(${"booking_id_seq"})`;
      }),
    agencyId: text("agency_id")
      .references(() => agencies.id, { onDelete: "cascade" })
      .notNull(),
    customerId: text("customer_id")
      .references(() => customers.id, { onDelete: "cascade" })
      .notNull(),
    assignedVehicleId: text("assigned_vehicle_id").references(
      () => vehicles.id,
      { onDelete: "set null" }
    ),
    assignedDriverId: text("assigned_driver_id").references(() => drivers.id, {
      onDelete: "set null",
    }),
    bookedByUserId: text("booked_by_user_id")
      .references(() => users.id, { onDelete: "set null" })
      .notNull(),
    assignedUserId: text("assigned_user_id")
      .references(() => users.id, { onDelete: "set null" })
      .notNull(),
    sourceId: text("source_id")
      .references(() => locations.id, { onDelete: "set null" })
      .notNull(),
    destinationId: text("destination_id")
      .references(() => locations.id, { onDelete: "set null" })
      .notNull(),
    routeId: text("route_id").references(() => routes.id, {
      onDelete: "set null",
    }),
    totalDistance: integer("total_distance"), // in kilometers
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    startTime: time("start_time"),
    type: bookingType().notNull().default("OneWay"),
    passengers: integer("passengers").notNull().default(1),
    needsAc: boolean("needs_ac").notNull().default(true),
    remarks: text("remarks"),
    ratePerKm: integer("rate_per_km").notNull(), // in currency units
    allowancePerDay: integer("allowance_per_day").notNull(), // in currency units
    commissionRate: integer("commission_rate").notNull(), // in percentage
    totalAmount: integer("total_amount").notNull(), // in currency units
    ratingByDriver: integer("rating_by_driver"), // 1 to 5
    status: bookingStatus().notNull().default("quote"),
    ...timestamps,
  },
  (t) => [
    check(
      "commission_rate >= 0 AND commission_rate <= 100",
      sql`${t.commissionRate} >= 0 AND ${t.commissionRate} <= 100`
    ),
    check(
      "passengers > 0 and < 100",
      sql`${t.passengers} > 0 AND ${t.passengers} < 100`
    ),
    check(
      "rate per km > 0 and < 50",
      sql`${t.ratePerKm} > 0 AND ${t.ratePerKm} < 50`
    ),
    check(
      "allowance >= 0 and allowance < 10000",
      sql`${t.allowancePerDay} >= 0 AND ${t.allowancePerDay} < 10000`
    ),
    check("end_date >= start_date", sql`${t.endDate} >= ${t.startDate}`),
    check(
      "total_amount > 0 and < 1000000",
      sql`${t.totalAmount} > 0 AND ${t.totalAmount} < 1000000`
    ),
    check(
      "rating >=1 and rating <=5",
      sql`${t.ratingByDriver} >=1 AND ${t.ratingByDriver} <=5`
    ),
    index("bookings_agency_idx").on(t.agencyId), // to quickly filter all bookings in an agency
    index("bookings_agency_status_idx").on(t.status, t.agencyId), // to quickly filter bookings by status in an agency
    index("bookings_agency_customer_idx").on(t.customerId, t.agencyId), // to quickly filter bookings by customer in an agency
    index("bookings_agency_assigned_user_idx").on(t.assignedUserId, t.agencyId), // to quickly filter bookings by assigned user in an agency
    index("bookings_agency_booked_by_user_idx").on(
      t.bookedByUserId,
      t.agencyId
    ), // to quickly filter bookings by booked by user in an agency
    index("bookings_agency_driver_idx").on(t.assignedDriverId, t.agencyId), // to quickly filter bookings by assigned driver in an agency
    index("bookings_agency_vehicle_idx").on(t.assignedVehicleId, t.agencyId), // to quickly filter bookings by assigned vehicle in an agency
    index("bookings_agency_start_date_idx").on(t.startDate, t.agencyId), // to quickly filter bookings by start date in an agency
    index("bookings_agency_end_date_idx").on(t.endDate, t.agencyId), // to quickly filter bookings by end date in an agency
    index("bookings_agency_source_idx").on(t.sourceId, t.agencyId), // to quickly filter bookings by source location in an agency
    index("bookings_agency_destination_idx").on(t.destinationId, t.agencyId), // to quickly filter bookings by destination location in an agency
    index("bookings_agency_route_idx").on(t.routeId, t.agencyId), // to quickly filter bookings by route in an agency
    index("bookings_agency_type_idx").on(t.type, t.agencyId), // to quickly filter bookings by type in an agency
  ]
);
export const bookingRelations = relations(bookings, ({ one, many }) => ({
  agency: one(agencies, {
    fields: [bookings.agencyId],
    references: [agencies.id],
  }),
  customer: one(customers, {
    fields: [bookings.customerId],
    references: [customers.id],
  }),
  assignedUser: one(users, {
    fields: [bookings.assignedUserId],
    references: [users.id],
    relationName: "bookings_assigned_user_fkey",
  }),
  bookedByUser: one(users, {
    fields: [bookings.bookedByUserId],
    references: [users.id],
    relationName: "bookings_booked_by_user_fkey",
  }),
  assignedVehicle: one(vehicles, {
    fields: [bookings.assignedVehicleId],
    references: [vehicles.id],
  }),
  assignedDriver: one(drivers, {
    fields: [bookings.assignedDriverId],
    references: [drivers.id],
  }),
  source: one(locations, {
    fields: [bookings.sourceId],
    references: [locations.id],
    relationName: "booking_source_fkey",
  }),
  destination: one(locations, {
    fields: [bookings.destinationId],
    references: [locations.id],
    relationName: "booking_destination_fkey",
  }),
  route: one(routes, { fields: [bookings.routeId], references: [routes.id] }),
  tripLogs: many(tripLogs),
  expenses: many(expenses),
  transactions: many(transactions),
}));

//Expenses table
export const expenseTypes = pgEnum("expense_types", [
  "fuel",
  "toll",
  "parking",
  "maintenance",
  "ac",
  "food",
  "other",
]);
export const expenseIdSequence = pgSequence("expense_id_seq", {
  ...sequenceValues,
});
export const expenses = pgTable(
  "expenses",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => {
        return sql`'E' || nextval(${"expense_id_seq"})`;
      }),
    agencyId: text("agency_id")
      .references(() => agencies.id, { onDelete: "cascade" })
      .notNull(),
    bookingId: text("booking_id").references(() => bookings.id, {
      onDelete: "cascade",
    }),
    addedByUserId: text("added_by_user_id")
      .references(() => users.id, { onDelete: "set null" })
      .notNull(),
    type: expenseTypes().notNull(),
    amount: integer("amount").notNull(), // in currency units
    remarks: text("remarks"),
    photoUrl: text("photo_url"), //multiple docs
    isApproved: boolean("is_approved").notNull().default(false),
    ...timestamps,
  },
  (t) => [
    check(
      "amount > 0 and < 1000000",
      sql`${t.amount} > 0 AND ${t.amount} < 1000000`
    ),
    index("expenses_booking_idx").on(t.bookingId), // to quickly filter expenses by booking
    index("expenses_booking_type_idx").on(t.type, t.bookingId), // to quickly filter expenses by type in a booking
    index("expenses_booking_approved_idx").on(t.isApproved, t.bookingId), // to quickly filter expenses by approval status in a booking
    index("expenses_agency_user_idx").on(t.addedByUserId, t.agencyId), // to quickly filter expenses added by a user in an agency
  ]
);
export const expenseRelations = relations(expenses, ({ one }) => ({
  agency: one(agencies, {
    fields: [expenses.agencyId],
    references: [agencies.id],
  }),
  booking: one(bookings, {
    fields: [expenses.bookingId],
    references: [bookings.id],
  }),
  addedByUser: one(users, {
    fields: [expenses.addedByUserId],
    references: [users.id],
  }),
}));

//Trip Logs table
export const tripLogTypes = pgEnum("trip_log_types", [
  "start_trip",
  "end_trip",
  "arrived",
  "pickup",
  "drop",
]);
export const tripLogIdSequence = pgSequence("trip_log_id_seq", {
  ...sequenceValues,
});
export const tripLogs = pgTable(
  "trip_logs",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => {
        return sql`'TL' || nextval(${"trip_log_id_seq"})`;
      }),
    bookingId: text("booking_id")
      .references(() => bookings.id, { onDelete: "cascade" })
      .notNull(),
    agencyId: text("agency_id")
      .references(() => agencies.id, { onDelete: "cascade" })
      .notNull(),
    vehicleId: text("vehicle_id")
      .references(() => vehicles.id, { onDelete: "set null" })
      .notNull(),
    driverId: text("driver_id")
      .references(() => drivers.id, { onDelete: "set null" })
      .notNull(),
    odometerReading: integer("odometer_reading").notNull(), // in kilometers
    type: tripLogTypes().notNull(),
    remarks: text("remarks"),
    photoUrl: text("photo_url"),
    latLong: varchar("lat_long", { length: 50 }), // "lat,long"
    ...timestamps,
  },
  (t) => [
    check(
      "odometer >= 0 and < 1000000",
      sql`${t.odometerReading} >= 0 AND ${t.odometerReading} < 1000000`
    ),
    index("trip_logs_booking_idx").on(t.bookingId), // to quickly filter trip logs by booking
    index("trip_logs_booking_type_idx").on(t.type, t.bookingId), // to quickly filter trip logs by type in a booking
    index("trip_logs_agency_vehicle_idx").on(t.vehicleId, t.agencyId), // to quickly filter trip logs by vehicle in an agency
    index("trip_logs_agency_driver_idx").on(t.driverId, t.agencyId), // to quickly filter trip logs by driver in an agency
  ]
);
export const tripLogsRelations = relations(tripLogs, ({ one }) => ({
  agency: one(agencies, {
    fields: [tripLogs.agencyId],
    references: [agencies.id],
  }),
  booking: one(bookings, {
    fields: [tripLogs.bookingId],
    references: [bookings.id],
  }),
  driver: one(drivers, {
    fields: [tripLogs.driverId],
    references: [drivers.id],
  }),
  vehicle: one(vehicles, {
    fields: [tripLogs.vehicleId],
    references: [vehicles.id],
  }),
}));

//Transactions table
export const transactionTypes = pgEnum("transaction_types", [
  "debit",
  "credit",
]);
export const transactionParties = pgEnum("transaction_parties", [
  "driver",
  "customer",
]);
export const transactionModes = pgEnum("transaction_modes", [
  "cash",
  "card",
  "upi",
  "other",
]);
export const transactionIdSequence = pgSequence("transaction_id_seq", {
  ...sequenceValues,
});
export const transactions = pgTable(
  "transactions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => {
        return sql`'T' || nextval(${"transaction_id_seq"})`;
      }),
    agencyId: text("agency_id")
      .references(() => agencies.id, { onDelete: "cascade" })
      .notNull(),
    bookingId: text("booking_id").references(() => bookings.id, {
      onDelete: "cascade",
    }),
    addedByUserId: text("added_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    amount: integer("amount").notNull(), // in currency units
    otherParty: transactionParties().notNull().default("customer"),
    type: transactionTypes().notNull(),
    mode: transactionModes().notNull().default("cash"),
    remarks: text("remarks"),
    isApproved: boolean("is_approved").notNull().default(false),
    ...timestamps,
  },
  (t) => [
    check(
      "amount > 0 and < 1000000",
      sql`${t.amount} > 0 AND ${t.amount} < 1000000`
    ),
    index("transactions_booking_idx").on(t.bookingId), // to quickly filter transactions by booking
    index("transactions_booking_type_idx").on(t.type, t.bookingId), // to quickly filter transactions by type in a booking
    index("transactions_booking_party_idx").on(t.otherParty, t.bookingId), // to quickly filter transactions by other party in a booking
    index("transactions_booking_approved_idx").on(t.isApproved, t.bookingId), // to quickly filter transactions by approval status in a booking
    index("transactions_agency_user_idx").on(t.addedByUserId, t.agencyId), // to quickly filter transactions added by a user in an agency
  ]
);
export const transactionRelations = relations(transactions, ({ one }) => ({
  agency: one(agencies, {
    fields: [transactions.agencyId],
    references: [agencies.id],
  }),
  booking: one(bookings, {
    fields: [transactions.bookingId],
    references: [bookings.id],
  }),
  addedByUser: one(users, {
    fields: [transactions.addedByUserId],
    references: [users.id],
  }),
}));

//Locations table
export const locationIdSequence = pgSequence("location_id_seq", {
  ...sequenceValues,
});
export const locations = pgTable(
  "locations",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => {
        return sql`'L' || nextval(${"location_id_seq"})`;
      }),
    city: varchar("city", { length: 30 }).notNull(),
    state: varchar("state", { length: 30 }).notNull(),
    latLong: varchar("lat_long", { length: 50 }), // "lat,long"
    location: geometry("location", {
      type: "point",
      mode: "xy",
      srid: 4326,
    }).notNull(),
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps,
  },
  (t) => [
    unique().on(t.city, t.state), //same location cannot be added twice
    uniqueIndex("locations_city_state_idx").on(t.city, t.state), // to quickly find unique location by city and state
    index("locations_active_idx").on(t.isActive), // to quickly filter active/inactive locations
    index("locations_spatial_idx").using("gist", t.location), // to quickly filter locations by spatial queries
  ]
);
export const locationRelations = relations(locations, ({ many }) => ({
  agencies: many(agencies),
  customers: many(customers),
  bookingSources: many(bookings, { relationName: "booking_source_fkey" }),
  bookingDestinations: many(bookings, {
    relationName: "booking_destination_fkey",
  }),
  routeSources: many(routes, { relationName: "route_source_fkey" }),
  routeDestinations: many(routes, { relationName: "route_destination_fkey" }),
}));

//Vehicle Services table
export const vehicleServiceIdSequence = pgSequence("vehicle_service_id_seq", {
  ...sequenceValues,
});
export const vehicleServices = pgTable(
  "vehicle_services",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => {
        return sql`'VS' || nextval(${"vehicle_service_id_seq"})`;
      }),
    agencyId: text("agency_id")
      .references(() => agencies.id, { onDelete: "cascade" })
      .notNull(),
    vehicleId: text("vehicle_id")
      .references(() => vehicles.id, { onDelete: "cascade" })
      .notNull(),
    addedByUserId: text("added_by_user_id")
      .references(() => users.id, { onDelete: "set null" })
      .notNull(),
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    remarks: text("remarks"),
    ...timestamps,
  },
  (t) => [
    check("end_date >= start_date", sql`${t.endDate} >= ${t.startDate}`),
    index("vehicle_services_agency_vehicle_idx").on(t.vehicleId, t.agencyId), // to quickly filter vehicle services by vehicle in an agency
    index("vehicle_services_agency_user_idx").on(t.addedByUserId, t.agencyId), // to quickly filter vehicle services added by a user in an agency
    index("vehicle_services_agency_start_date_idx").on(t.startDate, t.agencyId), // to quickly filter vehicle services by start date in an agency
    index("vehicle_services_agency_end_date_idx").on(t.endDate, t.agencyId), // to quickly filter vehicle services by end date in an agency
  ]
);
export const vehicleServiceRelations = relations(
  vehicleServices,
  ({ one }) => ({
    agency: one(agencies, {
      fields: [vehicleServices.agencyId],
      references: [agencies.id],
    }),
    vehicle: one(vehicles, {
      fields: [vehicleServices.vehicleId],
      references: [vehicles.id],
    }),
    addedByUser: one(users, {
      fields: [vehicleServices.addedByUserId],
      references: [users.id],
    }),
  })
);

//Driver Leaves table
export const driverLeaveIdSequence = pgSequence("driverLeave_id_seq", {
  ...sequenceValues,
});
export const driverLeaves = pgTable(
  "driver_leaves",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => {
        return sql`'DL' || nextval(${"driver_leave_id_seq"})`;
      }),
    agencyId: text("agency_id")
      .references(() => agencies.id, { onDelete: "cascade" })
      .notNull(),
    driverId: text("driver_id")
      .references(() => drivers.id, { onDelete: "cascade" })
      .notNull(),
    addedByUserId: text("added_by_user_id")
      .references(() => users.id, { onDelete: "set null" })
      .notNull(),
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    remarks: text("remarks"),
    ...timestamps,
  },
  (t) => [
    check("end_date >= start_date", sql`${t.endDate} >= ${t.startDate}`),
    index("driver_leaves_agency_driver_idx").on(t.driverId, t.agencyId), // to quickly filter driver leaves by driver in an agency
    index("driver_leaves_agency_user_idx").on(t.addedByUserId, t.agencyId), // to quickly filter driver leaves added by a user in an agency
    index("driver_leaves_agency_start_date_idx").on(t.startDate, t.agencyId), // to quickly filter driver leaves by start date in an agency
    index("driver_leaves_agency_end_date_idx").on(t.endDate, t.agencyId), // to quickly filter driver leaves by end date in an agency
  ]
);
export const driverLeaveRelations = relations(driverLeaves, ({ one }) => ({
  agency: one(agencies, {
    fields: [driverLeaves.agencyId],
    references: [agencies.id],
  }),
  driver: one(drivers, {
    fields: [driverLeaves.driverId],
    references: [drivers.id],
  }),
  addedByUser: one(users, {
    fields: [driverLeaves.addedByUserId],
    references: [users.id],
  }),
}));

//Export types
export type SelectAgency = typeof agencies.$inferSelect;
export type InsertAgency = typeof agencies.$inferInsert;

export type SelectUser = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type SelectSession = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;

export type SelectVehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = typeof vehicles.$inferInsert;

export type SelectDriver = typeof drivers.$inferSelect;
export type InsertDriver = typeof drivers.$inferInsert;

export type SelectRoute = typeof routes.$inferSelect;
export type InsertRoute = typeof routes.$inferInsert;

export type SelectCustomer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;

export type SelectBooking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;

export type SelectExpense = typeof expenses.$inferSelect;
export type InsertExpense = typeof expenses.$inferInsert;

export type SelectTripLog = typeof tripLogs.$inferSelect;
export type InsertTripLog = typeof tripLogs.$inferInsert;

export type SelectTransaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

export type SelectLocation = typeof locations.$inferSelect;
export type InsertLocation = typeof locations.$inferInsert;

export type SelectVehicleService = typeof vehicleServices.$inferSelect;
export type InsertVehicleService = typeof vehicleServices.$inferInsert;

export type SelectDriverLeave = typeof driverLeaves.$inferSelect;
export type InsertDriverLeave = typeof driverLeaves.$inferInsert;
