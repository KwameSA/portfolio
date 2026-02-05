// ===== GLOBAL STATE =====
let heroSlides = [];
let currentHeroSlide = 0;

let projectsData = {
  descriptions: [],
  images: [],
  switcher: [],
};
let currentProject = "Kanba-DO";
let currentSlideIndex = 0;
let currentProjectData = null;
let currentProjectSlideIndex = 0;
let activeProjectCategory = "all";
let filteredProjects = [];

// ===== DOM ELEMENTS =====
// Hero
const heroPrevBtn = document.querySelector(".hero-prev");
const heroNextBtn = document.querySelector(".hero-next");
const heroHeading = document.getElementById("hero-heading");
const heroSlider = document.getElementById("heroSlider");
const heroImage = document.getElementById("heroImage");
const heroWrapper = document.getElementById("heroWrapper");
const hero = document.getElementById("hero");
const heroBgPrimary = document.querySelector(".hero-bg-primary");
const heroBgSecondary = document.querySelector(".hero-bg-secondary");
let activeHeroBgLayer = "primary";

// Projects
const projectPrevBtn = document.querySelector(".project-prev");
const projectNextBtn = document.querySelector(".project-next");
const projectSelect = document.getElementById("projectSelect");
const projectCategorySelect = document.getElementById("projectCategory");
const projectTitle = document.getElementById("project-title");
const projectSlideshow = document.querySelector(".project-slideshow");
const projectDescriptionContainer = document.querySelector(".project-description-container");
const toggleButton = document.querySelector(".theme-toggle");
const htmlElement = document.documentElement;
const projectSection = document.getElementById("projects");

function setHeroBackground(imageUrl, immediate = false) {
  if (!imageUrl || !heroBgPrimary || !heroBgSecondary) return;

  const currentLayer = activeHeroBgLayer === "primary" ? heroBgPrimary : heroBgSecondary;
  const nextLayer = activeHeroBgLayer === "primary" ? heroBgSecondary : heroBgPrimary;
  nextLayer.style.backgroundImage = `url('${imageUrl}')`;

  if (immediate) {
    currentLayer.classList.remove("is-visible");
    nextLayer.classList.add("is-visible");
    activeHeroBgLayer = activeHeroBgLayer === "primary" ? "secondary" : "primary";
    return;
  }

  requestAnimationFrame(() => {
    nextLayer.classList.add("is-visible");
    currentLayer.classList.remove("is-visible");
    activeHeroBgLayer = activeHeroBgLayer === "primary" ? "secondary" : "primary";
  });
}

async function loadHero() {
  try {
    const response = await fetch("./data/hero.json");
    if (!response.ok) throw new Error("Hero JSON not found");
    const heroData = await response.json();

    heroImage.src = heroData.image.src;
    heroImage.alt = heroData.image.alt;

    heroWrapper.innerHTML = "";

    heroData.slides.forEach((slide, index) => {
      const slideDiv = document.createElement("div");
      slideDiv.classList.add("hero-slide");
      if (index === 0) slideDiv.classList.add("active");
      slideDiv.dataset.title = slide.title;
      slideDiv.dataset.background = slide.background;

      slide.content.forEach((text) => {
        const p = document.createElement("p");
        p.innerHTML = text;
        slideDiv.appendChild(p);
      });

      heroWrapper.appendChild(slideDiv);
    });

    heroSlides = document.querySelectorAll(".hero-slide");
    heroHeading.textContent = heroSlides[0]?.dataset.title || "";
    if (heroSlides[0]) {
      setHeroBackground(heroSlides[0].dataset.background, true);
    }
  } catch (err) {
    console.error("Error loading hero section:", err);
  }
}

function fadeHeroSlide(newIndex) {
  if (newIndex === currentHeroSlide) return;

  const current = heroSlides[currentHeroSlide];
  const next = heroSlides[newIndex];
  if (!current || !next) return;

  current.classList.remove("active");
  next.classList.add("active");
  setHeroBackground(next.dataset.background);
  heroHeading.textContent = next.dataset.title || "";
  currentHeroSlide = newIndex;
}

if (heroPrevBtn && heroNextBtn) {
  heroPrevBtn.addEventListener("click", () => {
    const newIndex = (currentHeroSlide - 1 + heroSlides.length) % heroSlides.length;
    fadeHeroSlide(newIndex);
  });

  heroNextBtn.addEventListener("click", () => {
    const newIndex = (currentHeroSlide + 1) % heroSlides.length;
    fadeHeroSlide(newIndex);
  });
}

// PROJECTS SECTION
async function loadAllProjects() {
  try {
    // Load descriptions
    const descRes = await fetch("./data/project_descriptions.json");
    if (!descRes.ok) throw new Error("Descriptions JSON not found");
    projectsData.descriptions = await descRes.json();

    // Load images
    const imgRes = await fetch("./data/project_images.json");
    if (!imgRes.ok) throw new Error("Images JSON not found");
    projectsData.images = await imgRes.json();

    // Load switcher
    const switchRes = await fetch("./data/projects_switcher.json");
    if (!switchRes.ok) throw new Error("Switcher JSON not found");
    projectsData.switcher = await switchRes.json();

    // Initialize the project dropdown
    applyProjectFilter(activeProjectCategory);
  } catch (err) {
    console.error("Error loading project data:", err);
  }
}

function populateProjectDropdown() {
  projectSelect.innerHTML = ""; // clear old options

  filteredProjects.forEach((proj) => {
    const option = document.createElement("option");
    option.value = proj.id;
    option.textContent = proj.title;
    projectSelect.appendChild(option);
  });
}

function applyProjectFilter(category) {
  activeProjectCategory = category;
  setProjectCategoryTheme(category);
  filteredProjects = projectsData.switcher.filter(
    (proj) => category === "all" || proj.category === category
  );

  populateProjectDropdown();

  if (filteredProjects.length === 0) {
    projectTitle.textContent = "No projects in this category yet.";
    projectDescriptionContainer.innerHTML = "";
    projectSlideshow.innerHTML = "";
    return;
  }

  const fallbackProjectId = filteredProjects[0].id;
  const selectedProjectId = filteredProjects.some((proj) => proj.id === currentProject) ? currentProject : fallbackProjectId;
  projectSelect.value = selectedProjectId;
  setCurrentProject(selectedProjectId);
}

function setProjectCategoryTheme(category) {
  if (!projectSection) return;
  projectSection.classList.remove("projects-theme-all", "projects-theme-data", "projects-theme-software", "projects-theme-cloud");
  projectSection.classList.add(`projects-theme-${category}`);
}

function setCurrentProject(projectId) {
  currentProject = projectId;

  // Set project title
  const projectInfo = projectsData.switcher.find((p) => p.id === projectId);
  projectTitle.textContent = projectInfo?.title || "";

  // Set description
  const descriptionObj = projectsData.descriptions.find((p) => p.id === projectId);
  const descContainer = document.querySelector(".project-description-container");
  descContainer.innerHTML = ""; // clear old description

  if (descriptionObj) {
    const desc = descriptionObj.description;
    ["purpose", "role", "outcome", "learned"].forEach((section) => {
      if (desc[section]) {
        const h3 = document.createElement("h3");
        h3.textContent = section.charAt(0).toUpperCase() + section.slice(1);
        const p = document.createElement("p");
        p.textContent = desc[section];
        descContainer.appendChild(h3);
        descContainer.appendChild(p);
      }
    });

    if (desc.links) {
      const linksDiv = document.createElement("div");
      linksDiv.classList.add("project-links");

      if (desc.links.repository) {
        const aRepo = document.createElement("a");
        aRepo.href = desc.links.repository;
        aRepo.textContent = "Repository";
        aRepo.target = "_blank";
        linksDiv.appendChild(aRepo);
      }

      if (desc.links.live) {
        const aLive = document.createElement("a");
        aLive.href = desc.links.live;
        aLive.textContent = "Live Demo";
        aLive.target = "_blank";
        linksDiv.appendChild(aLive);
      }

      descContainer.appendChild(linksDiv);
    }
  }

  const imagesObj = projectsData.images.find((p) => p.id === projectId);
  const slideshow = document.querySelector(".project-slideshow");
  slideshow.innerHTML = "";

  if (imagesObj) {
    imagesObj.images.forEach((img, index) => {
      const imgEl = document.createElement("img");
      imgEl.src = img.src;
      imgEl.alt = img.alt;
      imgEl.classList.add("project-slide");
      imgEl.style.display = index === 0 ? "block" : "none";
      slideshow.appendChild(imgEl);
    });

    currentProjectSlideIndex = 0;
  }
}

function showProjectSlide(index) {
  const slides = projectSlideshow.querySelectorAll(".project-slide");
  if (slides.length === 0) return;

  slides.forEach((slide, i) => {
    slide.style.display = i === index ? "block" : "none";
  });

  currentProjectSlideIndex = index;
}

function addSwipeNavigation(element, onSwipeLeft, onSwipeRight) {
  if (!element) return;

  let startX = 0;
  let startY = 0;

  element.addEventListener(
    "touchstart",
    (event) => {
      const touch = event.changedTouches[0];
      startX = touch.clientX;
      startY = touch.clientY;
    },
    { passive: true }
  );

  element.addEventListener(
    "touchend",
    (event) => {
      const touch = event.changedTouches[0];
      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;

      // Trigger only for intentional horizontal swipes.
      if (Math.abs(deltaX) < 40 || Math.abs(deltaX) < Math.abs(deltaY)) return;

      if (deltaX < 0) {
        onSwipeLeft();
      } else {
        onSwipeRight();
      }
    },
    { passive: true }
  );
}

if (projectPrevBtn && projectNextBtn) {
  projectPrevBtn.addEventListener("click", () => {
    const slides = projectSlideshow.querySelectorAll(".project-slide");
    if (slides.length === 0) return;

    let newIndex = (currentProjectSlideIndex - 1 + slides.length) % slides.length;
    showProjectSlide(newIndex);
  });

  projectNextBtn.addEventListener("click", () => {
    const slides = projectSlideshow.querySelectorAll(".project-slide");
    if (slides.length === 0) return;

    let newIndex = (currentProjectSlideIndex + 1) % slides.length;
    showProjectSlide(newIndex);
  });
}

if (projectSelect) {
  projectSelect.addEventListener("change", function () {
    const projectId = this.value;

    setCurrentProject(projectId);
    if (projectSection) {
      projectSection.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      console.warn("No element with id 'projectSection' found.");
    }
  });
}

if (projectCategorySelect) {
  projectCategorySelect.addEventListener("change", function () {
    applyProjectFilter(this.value);
  });
}

addSwipeNavigation(
  heroSlider,
  () => {
    if (!heroSlides.length) return;
    const newIndex = (currentHeroSlide + 1) % heroSlides.length;
    fadeHeroSlide(newIndex);
  },
  () => {
    if (!heroSlides.length) return;
    const newIndex = (currentHeroSlide - 1 + heroSlides.length) % heroSlides.length;
    fadeHeroSlide(newIndex);
  }
);

addSwipeNavigation(
  projectSlideshow,
  () => {
    const slides = projectSlideshow.querySelectorAll(".project-slide");
    if (!slides.length) return;
    const newIndex = (currentProjectSlideIndex + 1) % slides.length;
    showProjectSlide(newIndex);
  },
  () => {
    const slides = projectSlideshow.querySelectorAll(".project-slide");
    if (!slides.length) return;
    const newIndex = (currentProjectSlideIndex - 1 + slides.length) % slides.length;
    showProjectSlide(newIndex);
  }
);

if (heroSlider) {
  heroSlider.setAttribute("tabindex", "0");
  heroSlider.setAttribute("aria-label", "Hero slider. Use left and right arrow keys to change slides.");
  heroSlider.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      if (!heroSlides.length) return;
      const newIndex = (currentHeroSlide + 1) % heroSlides.length;
      fadeHeroSlide(newIndex);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      if (!heroSlides.length) return;
      const newIndex = (currentHeroSlide - 1 + heroSlides.length) % heroSlides.length;
      fadeHeroSlide(newIndex);
    }
  });
}

if (projectSlideshow) {
  projectSlideshow.setAttribute("tabindex", "0");
  projectSlideshow.setAttribute("aria-label", "Project slideshow. Use left and right arrow keys to change images.");
  projectSlideshow.addEventListener("keydown", (event) => {
    const slides = projectSlideshow.querySelectorAll(".project-slide");
    if (!slides.length) return;

    if (event.key === "ArrowRight") {
      event.preventDefault();
      const newIndex = (currentProjectSlideIndex + 1) % slides.length;
      showProjectSlide(newIndex);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      const newIndex = (currentProjectSlideIndex - 1 + slides.length) % slides.length;
      showProjectSlide(newIndex);
    }
  });
}

const savedTheme = localStorage.getItem("theme");

if (savedTheme === "light") {
  htmlElement.classList.remove("dark-theme");
} else {
  // Default to dark theme
  htmlElement.classList.add("dark-theme");
}

// Toggle button
if (toggleButton) {
  toggleButton.addEventListener("click", () => {
    htmlElement.classList.toggle("dark-theme");

    if (htmlElement.classList.contains("dark-theme")) {
      localStorage.setItem("theme", "dark");
    } else {
      localStorage.setItem("theme", "light");
    }
  });
}

// if (toggleButton) {
//   // Only attach listener if the button exists
//   toggleButton.addEventListener("click", () => {
//     htmlElement.classList.toggle("dark-theme");
//     localStorage.setItem("theme", htmlElement.classList.contains("dark-theme") ? "dark" : "light");
//   });
// }

window.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("loaded");
  // Apply saved theme
  // const savedTheme = localStorage.getItem("theme");
  // if (savedTheme === "dark") {
  //   htmlElement.classList.add("dark-theme");
  // } else {
  //   htmlElement.classList.remove("dark-theme");
  // }

  // Apply saved theme regardless of page
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    htmlElement.classList.add("dark-theme");
  } else if (savedTheme === "light") {
    htmlElement.classList.remove("dark-theme");
  }

  // Load hero & projects after theme applied
  loadHero();
  loadAllProjects();
});
