const msg = document.getElementById("msg");

async function register() {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!name || !email || !password) {
    msg.innerText = "Please fill all fields.";
    return;
  }

  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();
    msg.innerText = data.message || data.error || "Registered successfully!";

    // ✅ Store userId in localStorage if registration is successful
    if (data.success && data.userId) {
      localStorage.setItem("userId", data.userId);
      alert("Registration successful! Redirecting to dashboard...");
      window.location.href = "/dashboard.html";
    }
  } catch (err) {
    msg.innerText = "Error connecting to server.";
    console.error(err);
  }
}

async function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    msg.innerText = "Please enter email and password.";
    return;
  }

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (data.success) {
      // ✅ Store full user info and userId in localStorage
      localStorage.setItem("bank_user", JSON.stringify(data.user));
      localStorage.setItem("userId", data.user.id);
      window.location.href = "/dashboard.html";
    } else {
      msg.innerText = data.message || "Login failed!";
    }
  } catch (err) {
    msg.innerText = "Server error.";
    console.error(err);
  }
}
