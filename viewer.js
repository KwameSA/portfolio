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

function renderPDF(filePath) {
  const viewer = document.querySelector(".page-viewer");
  const thumbnails = document.querySelector(".thumbnail-list");

  viewer.innerHTML = "";
  thumbnails.innerHTML = "";

  pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js";

  pdfjsLib.getDocument(filePath).promise.then((pdf) => {
    const numPages = pdf.numPages;

    for (let i = 1; i <= numPages; i++) {
      pdf.getPage(i).then((page) => {
        const containerWidth = viewer.clientWidth || 800;
        const unscaledViewport = page.getViewport({ scale: 1 });
        const scale = containerWidth / unscaledViewport.width;
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        canvas.classList.add("pdf-page");
        canvas.dataset.page = i; // For scroll targeting
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const ctx = canvas.getContext("2d");

        page.render({
          canvasContext: ctx,
          viewport: viewport,
        });

        // Add to viewer
        viewer.appendChild(canvas);

        // Create thumbnail
        const thumb = document.createElement("div");
        thumb.classList.add("thumb");
        thumb.textContent = `Page ${i}`;
        thumb.dataset.targetPage = i;

        thumb.addEventListener("click", () => {
          const target = viewer.querySelector(`[data-page="${i}"]`);
          if (target) {
            target.scrollIntoView({ behavior: "smooth", block: "start" });

            document.querySelectorAll(".thumb").forEach((el) => el.classList.remove("active-thumb"));
            thumb.classList.add("active-thumb");
          }
        });

        thumbnails.appendChild(thumb);
      });
    }

    // Add download link
    const downloadBtn = document.createElement("a");
    downloadBtn.href = filePath;
    downloadBtn.download = filePath.split("/").pop();
    downloadBtn.textContent = "⬇ Download PDF";
    downloadBtn.className = "download-link";
    viewer.appendChild(downloadBtn);
  });
}

function renderImage(filePath) {
  const viewer = document.querySelector(".page-viewer");
  const fileName = filePath.split("/").pop();

  const captions = {
    "kanba-dashboard.png": "Kanba-DO Dashboard Screenshot",
    "pricebite-results.jpg": "PriceBite Results Page",
    // Add more mappings here...
  };

  const caption = captions[fileName] || fileName;

  viewer.innerHTML = `
    <figure>
      <img src="${filePath}" alt="${fileName}" style="max-width: 100%; height: auto;" />
      <figcaption>${caption}</figcaption>
    </figure>
  `;
}

function renderText(filePath) {
  fetch(filePath)
    .then((response) => response.text())
    .then((data) => {
      const viewer = document.querySelector(".page-viewer");
      if (filePath.endsWith(".md")) {
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
    <p><a href="documents.html">← Back to Documents</a></p>
  `;
}
