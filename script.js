const menuButton = document.querySelector(".mobile-menu-button");
const mobileMenu = document.querySelector(".mobile-menu");
const mobileLinks = document.querySelectorAll(".mobile-menu a");
const navLinks = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll("main > section[id]");

function setMenu(open) {
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  mobileMenu.setAttribute("aria-hidden", String(!open));
  mobileMenu.classList.toggle("open", open);
  document.body.classList.toggle("menu-open", open);
}

menuButton.addEventListener("click", () => {
  setMenu(menuButton.getAttribute("aria-expanded") !== "true");
});

mobileLinks.forEach((link) => link.addEventListener("click", () => setMenu(false)));

const sectionObserver = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;

    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${visible.target.id}`);
    });
  },
  { rootMargin: "-18% 0px -62% 0px", threshold: [0, 0.2, 0.5] }
);

sections.forEach((section) => sectionObserver.observe(section));

const researchTrack = document.querySelector(".research-track");
const researchCards = [...document.querySelectorAll(".research-card")];
const carouselProgress = document.querySelector(".carousel-progress");
const carouselProgressBar = carouselProgress.querySelector("span");
const carouselCurrent = document.querySelector(".carousel-count strong");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const carouselSpeed = 20;
let carouselAnimation;
let carouselPosition = 0;
let previousFrameTime = 0;

researchCards.forEach((card) => {
  const clone = card.cloneNode(true);
  clone.setAttribute("aria-hidden", "true");
  clone.querySelectorAll("a, button, [tabindex]").forEach((element) => {
    element.setAttribute("tabindex", "-1");
  });
  researchTrack.append(clone);
});

function carouselLoopPoint() {
  const firstClone = researchTrack.children[researchCards.length];
  if (!researchCards.length || !firstClone) return 0;
  return firstClone.offsetLeft - researchCards[0].offsetLeft;
}

function updateCarouselProgress() {
  const loopPoint = carouselLoopPoint();
  if (!loopPoint) return;

  const position = ((researchTrack.scrollLeft % loopPoint) + loopPoint) % loopPoint;
  const progress = position / loopPoint;
  const absolutePosition = researchCards[0].offsetLeft + position;
  let current = 1;

  researchCards.forEach((card, index) => {
    if (absolutePosition >= card.offsetLeft) current = index + 1;
  });

  carouselProgressBar.style.width = `${progress * 100}%`;
  carouselProgress.setAttribute("aria-valuenow", String(Math.round(progress * 100)));
  carouselCurrent.textContent = String(current).padStart(2, "0");
}

function animateCarousel(frameTime) {
  if (!previousFrameTime) previousFrameTime = frameTime;
  const elapsed = Math.min(frameTime - previousFrameTime, 50);
  previousFrameTime = frameTime;
  carouselPosition += carouselSpeed * (elapsed / 1000);

  const loopPoint = carouselLoopPoint();
  if (loopPoint && carouselPosition >= loopPoint) {
    carouselPosition -= loopPoint;
  }

  researchTrack.scrollLeft = carouselPosition;
  carouselAnimation = requestAnimationFrame(animateCarousel);
}

function stopCarousel() {
  cancelAnimationFrame(carouselAnimation);
  carouselAnimation = undefined;
  previousFrameTime = 0;
}

function startCarousel() {
  if (reduceMotion.matches || document.hidden || carouselAnimation) return;
  carouselPosition = researchTrack.scrollLeft;
  carouselAnimation = requestAnimationFrame(animateCarousel);
}

researchTrack.addEventListener("pointerdown", stopCarousel);
researchTrack.addEventListener("pointerup", startCarousel);
researchTrack.addEventListener("pointercancel", startCarousel);
researchTrack.addEventListener("scroll", updateCarouselProgress, { passive: true });

researchTrack.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    researchTrack.scrollBy({ left: -researchTrack.clientWidth / 2, behavior: "smooth" });
  }
  if (event.key === "ArrowRight") {
    event.preventDefault();
    researchTrack.scrollBy({ left: researchTrack.clientWidth / 2, behavior: "smooth" });
  }
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) stopCarousel();
  else startCarousel();
});

reduceMotion.addEventListener("change", startCarousel);
updateCarouselProgress();
startCarousel();

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
    setMenu(false);
  }
});
