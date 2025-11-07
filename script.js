// script.js - gallery loader + contact form handler

// put current year in footer
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* -------------------------
   Gallery loader (unchanged)
   ------------------------- */
function renderGrid(data) {
  const grid = document.getElementById("worksGrid");
  if (!grid) return;
  if (!Array.isArray(data) || data.length === 0) {
    grid.innerHTML = '<div class="status">No artworks found.</div>';
    return;
  }

  grid.innerHTML = data
    .map(
      (item) => `
      <article class="card">
        <a href="${item.image || item.thumb}" target="_blank" rel="noopener">
          <img class="card__img" src="${item.thumb || item.image}" alt="${(item.title||'Untitled').replace(/"/g,'&quot;')}" />
        </a>
        <div class="card__body">
          <h3 class="card__title">${item.title || 'Untitled'}</h3>
          <div class="card__meta">${item.medium || ''}${item.medium && item.year ? ' — ' : ''}${item.year || ''}</div>
        </div>
      </article>`
    )
    .join("");
}

async function loadGallery() {
  try {
    const response = await fetch("./data/gallery.json");
    if (!response.ok) throw new Error("Failed to load gallery.json");
    const data = await response.json();
    renderGrid(data);
  } catch (error) {
    console.warn("Falling back to sample data:", error);
    // fallback sample (keeps UI functional when file unavailable)
    renderGrid([
      {
        title: "Aurora",
        year: 2024,
        medium: "Oil on canvas, 60×80 cm",
        image: "/images/work-01@2x.jpg",
        thumb: "/images/work-01.jpg",
      },
    ]);
  }
}
loadGallery();

/* -------------------------
   Contact form handling
   ------------------------- */
(function contactHandler() {
  const form = document.getElementById("form");
  if (!form) return;

  const submitBtn = form.querySelector(".btn-submit");
  const resultEl = document.getElementById("result");

  // Helper to show messages
  function showMessage(msg, kind = "info") {
    if (resultEl) {
      resultEl.textContent = msg;
      resultEl.style.color = kind === "error" ? "#f88" : (kind === "success" ? "#cfc" : "");
    }
  }

  // Graceful fallback: if action attribute is empty, don't try to submit remotely.
  const actionUrl = form.getAttribute("action") || "";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!submitBtn) return;

    // Basic client-side validation - checks required inputs
    const required = Array.from(form.querySelectorAll("[required]"));
    for (const el of required) {
      if (!el.value.trim()) {
        el.focus();
        showMessage("Please complete all required fields.", "error");
        return;
      }
    }

    // Create FormData
    const fd = new FormData(form);

    // UI: disable button while sending
    submitBtn.disabled = true;
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Sending…";
    showMessage(""); // clear

    // If no remote endpoint, simulate success locally
    if (!actionUrl) {
      // simulate async behavior
      await new Promise((r) => setTimeout(r, 700));
      showMessage("Message ready (no endpoint configured).", "success");
      form.reset();
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
      return;
    }

    try {
      const res = await fetch(actionUrl, {
        method: form.method || "POST",
        body: fd,
        // web3forms expects form-data (our HTML does this), don't set content-type manually
      });

      // Handle Web3Forms / similar service responses
      if (res.ok) {
        // try parse JSON if present
        let json = null;
        try { json = await res.json(); } catch(_) { /* not JSON */ }

        showMessage("Thanks — your message was sent.", "success");
        form.reset();
      } else {
        // get any useful server-provided message
        let text = `Server error: ${res.status}`;
        try { text = (await res.text()) || text; } catch(_) {}
        console.warn("Form submission failed:", res.status, text);
        showMessage("Could not send message. Please try again later.", "error");
      }
    } catch (err) {
      // network / CORS / timeout
      console.error("Form submit error:", err);
      showMessage("Network error. Please check your connection or try again later.", "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
})();
