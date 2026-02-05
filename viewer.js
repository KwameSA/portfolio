const fileParam = new URLSearchParams(window.location.search).get("doc");

if (!fileParam) {
  showError("No document selected. Please return to the Documents page and click a file.");
  throw new Error("Missing 'doc' parameter in URL.");
}

const fileExtension = fileParam.split(".").pop().toLowerCase();
const filePath = `files/${fileParam}`;

if (fileExtension === "pdf") {
  renderPDF(filePath);
} else if (["png", "jpg", "jpeg", "gif"].includes(fileExtension)) {
  renderImage(filePath);
} else if (["txt", "md"].includes(fileExtension)) {
  renderText(filePath);
} else {
  showError("Unsupported file type");
}

function renderPDF(path) {
  const viewer = document.querySelector(".page-viewer");
  const thumbnails = document.querySelector(".thumbnail-list");

  viewer.innerHTML = "";
  thumbnails.innerHTML = "";

  pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js";

  const renderedPages = new Set();
  const pageContainers = [];
  const thumbElements = [];

  pdfjsLib.getDocument(path).promise.then((pdf) => {
    const numPages = pdf.numPages;

    for (let i = 1; i <= numPages; i++) {
      const container = document.createElement("div");
      container.className = "pdf-page-container";
      container.dataset.page = String(i);
      viewer.appendChild(container);
      pageContainers.push(container);

      const thumb = document.createElement("button");
      thumb.type = "button";
      thumb.classList.add("thumb");
      thumb.textContent = `Page ${i}`;
      thumb.setAttribute("aria-label", `Go to page ${i}`);
      thumb.addEventListener("click", () => {
        container.scrollIntoView({ behavior: "smooth", block: "start" });
        setActiveThumb(i);
      });
      thumbnails.appendChild(thumb);
      thumbElements.push(thumb);
    }

    const mobile = window.matchMedia("(max-width: 768px)").matches;
    const renderObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const pageNumber = Number(entry.target.dataset.page);
          renderPage(pageNumber);
          renderObserver.unobserve(entry.target);
        });
      },
      { root: null, rootMargin: mobile ? "500px 0px" : "900px 0px" }
    );

    pageContainers.forEach((container) => renderObserver.observe(container));

    const activePageObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) {
          setActiveThumb(Number(visible[0].target.dataset.page));
        }
      },
      { root: null, threshold: [0.25, 0.6] }
    );

    pageContainers.forEach((container) => activePageObserver.observe(container));

    renderPage(1);
    if (numPages > 1) renderPage(2);
    setActiveThumb(1);

    const downloadBtn = document.createElement("a");
    downloadBtn.href = path;
    downloadBtn.download = path.split("/").pop();
    downloadBtn.textContent = "Download PDF";
    downloadBtn.className = "download-link";
    viewer.appendChild(downloadBtn);

    function setActiveThumb(pageNumber) {
      thumbElements.forEach((thumb, index) => {
        const isActive = index + 1 === pageNumber;
        thumb.classList.toggle("active-thumb", isActive);
        if (isActive) {
          thumb.setAttribute("aria-current", "page");
        } else {
          thumb.removeAttribute("aria-current");
        }
      });
    }

    function renderPage(pageNumber) {
      if (renderedPages.has(pageNumber)) return;
      renderedPages.add(pageNumber);

      pdf.getPage(pageNumber).then((page) => {
        const targetContainer = pageContainers[pageNumber - 1];
        if (!targetContainer) return;

        const containerWidth = targetContainer.clientWidth || viewer.clientWidth || 800;
        const baseViewport = page.getViewport({ scale: 1 });
        const rawScale = containerWidth / baseViewport.width;
        const maxScale = mobile ? 1.4 : 1.8;
        const scale = Math.min(rawScale, maxScale);
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        canvas.classList.add("pdf-page");
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const ctx = canvas.getContext("2d");
        page
          .render({
            canvasContext: ctx,
            viewport: viewport,
          })
          .promise.then(() => {
            targetContainer.innerHTML = "";
            targetContainer.appendChild(canvas);
          });
      });
    }
  });
}

function renderImage(path) {
  const viewer = document.querySelector(".page-viewer");
  const fileName = path.split("/").pop();

  const captions = {
    "kanba-dashboard.png": "Kanba-DO Dashboard Screenshot",
    "pricebite-results.jpg": "PriceBite Results Page",
  };

  const caption = captions[fileName] || fileName;

  viewer.innerHTML = `
    <figure>
      <img src="${path}" alt="${fileName}" style="max-width: 100%; height: auto;" />
      <figcaption>${caption}</figcaption>
    </figure>
  `;
}

function renderText(path) {
  fetch(path)
    .then((response) => response.text())
    .then((data) => {
      const viewer = document.querySelector(".page-viewer");
      if (path.endsWith(".md")) {
        viewer.innerHTML = marked.parse(data);
      } else {
        viewer.innerHTML = `<pre>${data}</pre>`;
      }
    })
    .catch((err) => {
      document.querySelector(".page-viewer").innerHTML = `<p style="color: red;">Failed to load file: ${err.message}</p>`;
    });
}

function showError(message) {
  document.querySelector(".page-viewer").innerHTML = `
    <p style="color: red;">${message}</p>
    <p><a href="documents.html">Back to Documents</a></p>
  `;
}
