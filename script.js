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
