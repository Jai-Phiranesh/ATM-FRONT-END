const BASE_URL = "http://localhost:8080/api/auth";

export async function loginUser(mobile: string, pin: string) {
  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mobile, pin }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function registerUser(name: string, email: string, mobile: string, pin: string) {
  const res = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, mobile, pin }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getBalance(mobile: string) {
  const res = await fetch(`${BASE_URL}/${mobile}/balance`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deposit(mobile: string, amount: number, denominations?: Record<number, number>) {
  const res = await fetch(`${BASE_URL}/${mobile}/deposit?amount=${amount}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ denominations })
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function withdraw(mobile: string, amount: number) {
  const res = await fetch(`${BASE_URL}/${mobile}/withdraw?amount=${amount}`, { method: "POST" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getTransactions(mobile: string) {
  const res = await fetch(`${BASE_URL}/${mobile}/transactions`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function changePin(mobile: string, oldPin: string, newPin: string) {
  const res = await fetch(`${BASE_URL}/${mobile}/changepin?oldPin=${oldPin}&newPin=${newPin}`, { method: "POST" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
