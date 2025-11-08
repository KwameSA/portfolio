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

// ===== DOM ELEMENTS =====
// Hero
const heroPrevBtn = document.querySelector(".hero-prev");
const heroNextBtn = document.querySelector(".hero-next");
const heroHeading = document.getElementById("hero-heading");
const heroSlider = document.getElementById("heroSlider");
const heroImage = document.getElementById("heroImage");
const heroWrapper = document.getElementById("heroWrapper");
const hero = document.getElementById("hero");

// Projects
const projectPrevBtn = document.querySelector(".project-prev");
const projectNextBtn = document.querySelector(".project-next");
const projectSelect = document.getElementById("projectSelect");
const projectTitle = document.getElementById("project-title");
const projectSlideshow = document.querySelector(".project-slideshow");
const projectDescriptionContainer = document.querySelector(".project-description-container");
const toggleButton = document.querySelector(".theme-toggle");
const htmlElement = document.documentElement;
const projectSection = document.getElementById("projects");

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
      hero.style.backgroundImage = `url('${heroSlides[0].dataset.background}')`;
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
  heroHeading.classList.add("fade-out-heading");

  current.style.opacity = 0;
  next.style.opacity = 1;
  next.style.transform = "translateX(0)";
  next.classList.add("active");
  heroHeading.classList.add("fade-out-heading");

  hero.style.backgroundImage = `url('${next.dataset.background}')`;

  setTimeout(() => {
    heroHeading.textContent = next.dataset.title; // <--- update here
    heroHeading.classList.remove("fade-out-heading");
    heroHeading.classList.add("fade-in-heading");

    setTimeout(() => heroHeading.classList.remove("fade-in-heading"), 400);

    current.classList.remove("active");
    current.style.transform = "translateX(50px)";
    currentHeroSlide = newIndex;
  }, 70);
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
    const descRes = await fetch("data/project_descriptions.json");
    if (!descRes.ok) throw new Error("Descriptions JSON not found");
    projectsData.descriptions = await descRes.json();

    // Load images
    const imgRes = await fetch("data/project_images.json");
    if (!imgRes.ok) throw new Error("Images JSON not found");
    projectsData.images = await imgRes.json();

    // Load switcher
    const switchRes = await fetch("data/projects_switcher.json");
    if (!switchRes.ok) throw new Error("Switcher JSON not found");
    projectsData.switcher = await switchRes.json();

    populateProjectDropdown();
    setCurrentProject(projectsData.switcher[0].id);
  } catch (err) {
    console.error("Error loading project data:", err);
  }
}

function populateProjectDropdown() {
  projectSelect.innerHTML = ""; 

  projectsData.switcher.forEach((proj) => {
    const option = document.createElement("option");
    option.value = proj.id;
    option.textContent = proj.title;
    projectSelect.appendChild(option);
  });

  projectSelect.addEventListener("change", function () {
    const projectId = this.value;

    setCurrentProject(projectId);
    // Scroll the project section into view
    if (projectSection) {
      projectSection.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      console.warn("No element with id 'projectSection' found.");
    }
  });
}

function setCurrentProject(projectId) {
  currentProject = projectId;

  // Set project title
  const projectInfo = projectsData.switcher.find((p) => p.id === projectId);
  projectTitle.textContent = projectInfo?.title || "";

  // Set description
  const descriptionObj = projectsData.descriptions.find((p) => p.id === projectId);
  const descContainer = document.querySelector(".project-description-container");
  descContainer.innerHTML = "";

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

const savedTheme = localStorage.getItem("theme");

if (savedTheme === "light") {
  htmlElement.classList.remove("dark-theme");
} else {
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

window.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("loaded");

  // Apply saved theme regardless of page
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    htmlElement.classList.add("dark-theme");
  } else if (savedTheme === "light") {
    htmlElement.classList.remove("dark-theme");
  }

  loadHero();
  loadAllProjects();
  populateProjectDropdown();
});


