/* ==========================================================
   Pooja Mehta Gallery — Main Script
   Handles:
   1️⃣ Footer year auto-update
   2️⃣ Dynamic art gallery loading (from /data/gallery.json)
   3️⃣ Contact form submission (Web3Forms API)
   ========================================================== */

// Auto-update footer year
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ----------------------------------------------------------
   1️⃣ GALLERY LOADER
---------------------------------------------------------- */
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
          <img class="card__img" src="${item.thumb || item.image}" alt="${(item.title || "Untitled")
                    .replace(/"/g, "&quot;")}" />
        </a>
        <div class="card__body">
          <h3 class="card__title">${item.title || "Untitled"}</h3>
          <div class="card__meta">${item.medium || ""}${item.medium && item.year ? " — " : ""}${item.year || ""}</div>
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
        renderGrid([
            {
                title: "Aurora",
                year: 2024,
                medium: "Oil on canvas, 60×80 cm",
                image: "/images/work-01@2x.jpg",
                thumb: "/images/work-01.jpg",
            },
            {
                title: "Echoes",
                year: 2025,
                medium: "Mixed media, 70×90 cm",
                image: "/images/work-02@2x.jpg",
                thumb: "/images/work-02.jpg",
            },
        ]);
    }
}
loadGallery();

/* ==========================================================
   CONTACT FORM HANDLER — EmailJS Integration
   ========================================================== */

(function () {
    emailjs.init("mVNxCxZ0CqVbcyiIA"); // Replace with your EmailJS Public Key
})();

const contactForm = document.getElementById("form");

if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const btn = contactForm.querySelector(".btn-submit");
        const result = document.getElementById("result");
        if (btn) {
            btn.disabled = true;
            btn.textContent = "Sending...";
        }
        if (result) result.textContent = "";

        try {
            const formData = {
                from_name: document.getElementById("name").value,
                from_email: document.getElementById("email").value,
                phone: document.getElementById("phone").value,
                message: document.getElementById("message").value,
            };



            const response = await emailjs.send(
                "service_6z7jlvl",   // replace with EmailJS service ID
                "template_huh9i8i",  // replace with EmailJS template ID
                formData
            );

            console.log("EmailJS response:", response);

            if (response.status === 200) {
                result.style.color = "#9ef79e";
                result.textContent = "Message sent successfully!";
                contactForm.reset();
            } else {
                result.style.color = "#f88";
                result.textContent = "Unexpected error. Please try again.";
            }
        } catch (error) {
            console.error("EmailJS Error:", error);
            result.style.color = "#f88";
            result.textContent = "Network error. Please check your connection.";
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.textContent = "Send Message";
            }
        }
    });
}
