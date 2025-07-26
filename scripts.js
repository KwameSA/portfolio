// === HERO SLIDES ===
const heroSlides = document.querySelectorAll(".hero-slide");
const heroPrevBtn = document.querySelector(".hero-prev");
const heroNextBtn = document.querySelector(".hero-next");
const heroHeading = document.getElementById("hero-heading");

let currentHeroSlide = 0;

function fadeHeroSlide(newIndex) {
  if (newIndex === currentHeroSlide) return;

  const current = heroSlides[currentHeroSlide];
  const next = heroSlides[newIndex];

  // Fade out current slide and heading
  current.classList.remove("active");
  heroHeading.classList.add("fade-out-heading");

  // Wait before showing next slide
  setTimeout(() => {
    // Update heading text
    heroHeading.textContent = next.getAttribute("data-title");

    // Fade in new slide
    next.classList.add("active");

    // Reset heading transition
    heroHeading.classList.remove("fade-out-heading");
    heroHeading.classList.add("fade-in-heading");

    // Clean up class after transition ends
    setTimeout(() => {
      heroHeading.classList.remove("fade-in-heading");
    }, 400);

    currentHeroSlide = newIndex;
  }, 300); // matches your CSS transition time
}

heroPrevBtn.addEventListener("click", () => {
  const newIndex = (currentHeroSlide - 1 + heroSlides.length) % heroSlides.length;
  fadeHeroSlide(newIndex);
});

heroNextBtn.addEventListener("click", () => {
  const newIndex = (currentHeroSlide + 1) % heroSlides.length;
  fadeHeroSlide(newIndex);
});

// === PROJECT SWITCHING ===
const projectTabs = document.querySelectorAll(".project-tab");
const projectTitle = document.getElementById("project-title");
const projectGroups = document.querySelectorAll(".project-images");
const projectDescriptions = document.querySelectorAll(".project-description");
const projectPrevBtn = document.querySelector(".project-prev");
const projectNextBtn = document.querySelector(".project-next");

let currentProject = null;
let currentSlideIndex = 0;

// Utility: Reset all states
function resetProjects() {
  projectGroups.forEach((group) => {
    group.classList.remove("active");
    group.querySelectorAll(".project-slide").forEach((slide) => slide.classList.remove("active"));
  });

  projectDescriptions.forEach((desc) => desc.classList.remove("active"));
}

// Activate selected project
function activateProject(projectName) {
  currentProject = projectName;
  currentSlideIndex = 0;

  resetProjects();

  const group = document.querySelector(`.project-images[data-project="${projectName}"]`);
  const slides = group?.querySelectorAll(".project-slide") || [];

  const desc = document.querySelector(`.project-description[data-project="${projectName}"]`);

  if (group && slides.length > 0) {
    group.classList.add("active");
    slides[0].classList.add("active");
  }

  if (desc) {
    desc.classList.add("active");
  }

  projectTitle.textContent = projectName;
}

// Tab Click
projectTabs.forEach((tab) => {
  tab.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopImmediatePropagation();
    tab.blur();

    // Scroll to current position to force browser to "lock in"
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    const projectName = tab.dataset.project;
    activateProject(projectName);

    // Restore scroll to where the user was
    window.scrollTo(scrollX, scrollY);
  });
});

// Navigation Arrows
function showSlide(offset) {
  const group = document.querySelector(`.project-images[data-project="${currentProject}"]`);
  const slides = group?.querySelectorAll(".project-slide");

  if (!slides || slides.length === 0) return;

  slides[currentSlideIndex].classList.remove("active");
  currentSlideIndex = (currentSlideIndex + offset + slides.length) % slides.length;
  slides[currentSlideIndex].classList.add("active");
}

projectPrevBtn.addEventListener("click", () => showSlide(-1));
projectNextBtn.addEventListener("click", () => showSlide(1));

// Initial Load: Set Kanba-DO as default
document.addEventListener("DOMContentLoaded", () => {
  activateProject("Kanba-DO");
});
