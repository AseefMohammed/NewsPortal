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

export async function fetchArticles() {
  try {
    const res = await fetch("/api/articles", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) throw new Error("Failed to fetch articles");
    return await res.json();
  } catch (err) {
    console.error("API error:", err);
    return [];
  }
}

export async function fetchSaves() {
  try {
    const res = await fetch("/api/saves", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) throw new Error("Failed to fetch saves");
    return await res.json();
  } catch (err) {
    console.error("API error:", err);
    return [];
  }
}

export async function askAI(question: string) {
  try {
    const res = await fetch("/api/askai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question }),
    });
    if (!res.ok) throw new Error("Failed to get AI response");
    return await res.json();
  } catch (err) {
    console.error("API error:", err);
    return null;
  }
}
