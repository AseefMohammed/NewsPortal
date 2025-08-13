// API utility for backend integration

export async function fetchUserProfile() {
  try {
    const res = await fetch("/api/profile", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) throw new Error("Failed to fetch profile");
    return await res.json();
  } catch (err) {
    console.error("API error:", err);
    return null;
  }
}
