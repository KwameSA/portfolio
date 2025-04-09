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
const projectGroups = document.querySelectorAll(".project-images");
const projectDescriptions = document.querySelectorAll(".project-description");
const projectTitle = document.getElementById("project-title");

let currentProject = "Kanba-DO";
let currentProjectSlide = 0;

function switchProject(newProject) {
  if (newProject === currentProject) return;

  // Hide current group
  document.querySelector(`.project-images[data-project="${currentProject}"]`).classList.remove("active");
  document.querySelector(`.project-description[data-project="${currentProject}"]`).classList.remove("active");

  // Show new group
  setTimeout(() => {
    document.querySelector(`.project-images[data-project="${newProject}"]`).classList.add("active");
    document.querySelector(`.project-description[data-project="${newProject}"]`).classList.add("active");

    projectTitle.textContent = newProject;
    currentProject = newProject;
    currentProjectSlide = 0;
    updateProjectSlides();
  }, 100);
}

projectTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const newProject = tab.dataset.project;
    switchProject(newProject);
  });
});

// === PROJECT SLIDE NAVIGATION ===
const projectPrevBtn = document.querySelector(".project-prev");
const projectNextBtn = document.querySelector(".project-next");

function updateProjectSlides() {
  const activeGroup = document.querySelector(`.project-images[data-project="${currentProject}"]`);
  const slides = activeGroup.querySelectorAll(".project-slide");

  slides.forEach((slide, index) => {
    slide.classList.toggle("active", index === currentProjectSlide);
  });
}

projectPrevBtn.addEventListener("click", () => {
  const slides = document.querySelector(`.project-images[data-project="${currentProject}"]`).querySelectorAll(".project-slide");
  currentProjectSlide = (currentProjectSlide - 1 + slides.length) % slides.length;
  updateProjectSlides();
});

projectNextBtn.addEventListener("click", () => {
  const slides = document.querySelector(`.project-images[data-project="${currentProject}"]`).querySelectorAll(".project-slide");
  currentProjectSlide = (currentProjectSlide + 1) % slides.length;
  updateProjectSlides();
});
