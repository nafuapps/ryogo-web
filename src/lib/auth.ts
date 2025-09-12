import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import {
  createSession,
  deleteSession,
  decrypt,
  SessionPayload,
} from "./session";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

export type SignupUserData = {
  agencyId: string;
  name: string;
  phone: string;
  email: string;
  password: string;
};

// Store user's last login time
export async function logUserLastLogin(userId: string) {
  await db
    .update(users)
    .set({ lastLogin: new Date() })
    .where(eq(users.id, userId));
}

// Login user - Validate user credentials and login with phone number
export async function login(phone: string, password: string) {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.phone, phone))
    .limit(1);

  if (!user[0]) return null;

  const valid = await bcrypt.compare(password, user[0].password);
  if (!valid) return null;

  await createSession(user[0].id);
  await logUserLastLogin(user[0].id);

  return user[0];
}

// Get current user from session
export async function getCurrentUser() {
  const session = (await cookies()).get("session")?.value;
  if (!session) return null;

  const payload = (await decrypt(session)) as SessionPayload | undefined;
  if (!payload) return null;

  //Get the user whose id matches the session's userId
  const sessionRecord = await db
    .select()
    .from(users)
    .where(eq(users.id, payload.userId))
    .limit(1);

  return sessionRecord[0] || null;
}

// Store user's last logout time
export async function logUserLastLogout(userId: string) {
  await db
    .update(users)
    .set({ lastLogout: new Date() })
    .where(eq(users.id, userId));
}

// Logout user - Delete session and log last logout time
export async function logout() {
  const session = (await cookies()).get("session")?.value;
  if (!session) return null;

  const payload = (await decrypt(session)) as SessionPayload | undefined;
  if (!payload) return null;

  await logUserLastLogout(payload.userId);
  await deleteSession();
}

//Generate password hash
export async function generatePasswordHash(password: string) {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  return hash;
}

//Signup user - Create new owner user
//TODO: Move this to proper route handler
export async function signupOwner(data: SignupUserData) {
  const existingUser = await db
    .select()
    .from(users)
    .where(
      and(
        eq(users.phone, data.phone),
        eq(users.agencyId, data.agencyId),
        eq(users.userRole, "owner")
      )
    )
    .limit(1);

  if (existingUser[0]) {
    throw new Error(
      "User with this phone number and role already exists in this agency"
    );
  }

  const passwordHash = await generatePasswordHash(data.password);

  const newUser = await db
    .insert(users)
    .values({
      agencyId: data.agencyId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: passwordHash,
      userRole: "owner",
    })
    .returning(); //Return the newly created user

  return newUser;
}

//Reset password
export async function resetPassword(userId: string) {
  const newPassword = Math.random().toString(36).slice(-8); //Generate a random 8 character password
  const passwordHash = await generatePasswordHash(newPassword);

  await db
    .update(users)
    .set({ password: passwordHash })
    .where(eq(users.id, userId));

  return newPassword; //Return the new password to be sent to the user
}
