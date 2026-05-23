export const API_URL = "/api";
export const WS_URL = "ws://localhost:8080";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  username: string;
}

export interface SignupPayload {
  username: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface Room {
  id: string;
  name: string;
}

export interface Client {
  id: string;
  username: string;
}

export interface ChatMessage {
  content: string;
  roomId: string;
  username: string;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function signupUser(payload: SignupPayload) {
  const res = await fetch(`${API_URL}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Signup failed");
  }

  return res.json();
}

export async function loginUser(payload: LoginPayload): Promise<User> {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Login failed");
  }

  return res.json();
}

export async function logoutUser(): Promise<void> {
  await fetch(`${API_URL}/logout`, {
    method: "GET",
    credentials: "include",
  });
}

// ─── Rooms ───────────────────────────────────────────────────────────────────

export async function getRooms(): Promise<Room[]> {
  const res = await fetch(`${API_URL}/ws/getRooms`, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to fetch rooms");

  return res.json();
}

export async function createRoom(room: Room): Promise<Room> {
  const res = await fetch(`${API_URL}/ws/createRoom`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(room),
  });

  if (!res.ok) throw new Error("Failed to create room");

  return res.json();
}

// ─── Clients ─────────────────────────────────────────────────────────────────

export async function getClients(roomId: string): Promise<Client[]> {
  const res = await fetch(`${API_URL}/ws/getClients/${roomId}`, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to fetch clients");

  return res.json();
}
