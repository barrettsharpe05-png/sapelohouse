const header = document.querySelector(".site-header");
const menuButton = document.querySelector(".menu-toggle");
const form = document.querySelector("[data-inquiry-form]");
const status = document.querySelector("[data-form-status]");

function setHeaderState() {
  header?.classList.toggle("is-scrolled", window.scrollY > 12);
}

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

menuButton?.addEventListener("click", () => {
  const isOpen = header.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
});

form?.addEventListener("submit", event => {
  event.preventDefault();
  status.textContent =
    "Your inquiry details are ready. Inquiry delivery will be activated before the website launches.";
  form.scrollIntoView({ block: "nearest", behavior: "smooth" });
});
