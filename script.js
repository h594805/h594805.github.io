// ===== Password Gate =====
(function(){
  const PASSWORD = "brosne";
  const gate = document.getElementById("gate");
  const form = document.getElementById("gateForm");
  const input = document.getElementById("gateInput");
  const error = document.getElementById("gateError");

  if (sessionStorage.getItem("wedding_unlocked") === "yes") {
    gate.style.display = "none";
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if ((input.value || "").trim().toLowerCase() === PASSWORD) {
      sessionStorage.setItem("wedding_unlocked", "yes");
      error.textContent = "\u00A0";
      error.classList.remove("show");

      gate.animate([{opacity:1},{opacity:0}], {duration:250, fill:"forwards"});
      setTimeout(() => { gate.style.display = "none"; }, 260);
    } else {
      error.textContent = "Feil passord. Prøv igjen.";
      error.classList.add("show");
      input.value = "";
      input.focus();
    }
  });
})();

// ===== Mobile Nav Toggle (hamburger on right) =====
(function(){
  const header = document.querySelector(".site-header");
  const toggle = document.getElementById("navToggle");
  const nav = document.getElementById("mainNav");
  if (!toggle || !nav || !header) return;

  toggle.addEventListener("click", () => {
    const open = header.classList.toggle("nav-open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });

  // Close menu when clicking a link (on small screens)
  nav.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => {
      if (header.classList.contains("nav-open")) {
        header.classList.remove("nav-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  });
})();

// ===== Smooth Scroll (header offset) =====
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href").slice(1);
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    const y = el.getBoundingClientRect().top + window.scrollY - 64;
    window.scrollTo({ top: y, behavior: "smooth" });
    history.pushState(null, "", `#${id}`);
  });
});

// ===== Countdown =====
(function(){
  const root = document.getElementById("countdown");
  if (!root) return;

  const statusEl = document.getElementById("cd-status");
  const targetStr = root.getAttribute("data-target") || "2026-05-23T14:00:00+02:00";
  const target = new Date(targetStr);

  const elDays  = document.getElementById("cd-days");
  const elHours = document.getElementById("cd-hours");
  const elMins  = document.getElementById("cd-mins");
  const elSecs  = document.getElementById("cd-secs");

  function pad2(n){ return n.toString().padStart(2,"0"); }
  function sameDayOslo(a, b){
    const aLocal = new Date(a.toLocaleString("en-GB", { timeZone: "Europe/Oslo" }));
    const bLocal = new Date(b.toLocaleString("en-GB", { timeZone: "Europe/Oslo" }));
    return aLocal.getFullYear() === bLocal.getFullYear()
        && aLocal.getMonth() === bLocal.getMonth()
        && aLocal.getDate() === bLocal.getDate();
  }

  function update(){
    const now = new Date();
    const diffMs = target - now;

    if (diffMs > 0){
      const sec = Math.floor(diffMs / 1000);
      const days = Math.floor(sec / 86400);
      const hours = Math.floor((sec % 86400) / 3600);
      const mins = Math.floor((sec % 3600) / 60);
      const secs = sec % 60;

      elDays.textContent  = String(days);
      elHours.textContent = pad2(hours);
      elMins.textContent  = pad2(mins);
      elSecs.textContent  = pad2(secs);

      if (statusEl) statusEl.textContent = "";
      return;
    }

    if (sameDayOslo(now, target)){
      if (statusEl) statusEl.textContent = "I dag!";
      elDays.textContent = "0"; elHours.textContent = "00";
      elMins.textContent = "00"; elSecs.textContent = "00";
      return;
    }

    const sinceMs = now - target;
    const sec = Math.floor(sinceMs / 1000);
    const days = Math.floor(sec / 86400);
    const hours = Math.floor((sec % 86400) / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;

    elDays.textContent  = String(days);
    elHours.textContent = pad2(hours);
    elMins.textContent  = pad2(mins);
    elSecs.textContent  = pad2(secs);

    if (statusEl) statusEl.textContent = "";
  }

  update();
  setInterval(update, 1000);
})();
