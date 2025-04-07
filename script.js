document.addEventListener("DOMContentLoaded", function () {
  fetch("/phases-metadata.json")
    .then((response) => response.json())
    .then((metadata) => {
 
      initializePhaseNavigation(metadata);

   
      if (metadata.phases && metadata.phases.length > 0) {
        loadPhaseContent(metadata.phases[0].id);
      }
    })
    .catch((error) => {
      console.error("Error loading roadmap metadata:", error);
      showErrorMessage("Failed to load roadmap data. Please try again later.");
    });
});


function initializePhaseNavigation(metadata) {
  const phaseNav = document.querySelector(".phase-nav");
  phaseNav.innerHTML = ""; 


  metadata.phases.forEach((phase, index) => {
    const button = document.createElement("button");
    button.className = "phase-btn" + (index === 0 ? " active" : "");
    button.dataset.phaseId = phase.id;
    button.textContent = phase.shortTitle || phase.title.split(":")[0];

    button.addEventListener("click", function (event) {
     
      document.querySelectorAll(".phase-btn").forEach((btn) => {
        btn.classList.remove("active");
      });
      this.classList.add("active");

     
      loadPhaseContent(phase.id);
    });

    phaseNav.appendChild(button);
  });
}


function loadPhaseContent(phaseId) {
  const contentContainer = document.getElementById("phase-content-container");

  
  const scrollPosition = window.scrollY;

  
  const initialHeight = contentContainer.offsetHeight;
  contentContainer.style.minHeight = `${initialHeight}px`;

 
  contentContainer.innerHTML =
    '<div class="loading">Loading phase content...</div>';

 
  fetch(`/${phaseId}.json`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to load phase data (${response.status})`);
      }
      return response.json();
    })
    .then((phaseData) => {
      renderPhaseContent(phaseData, contentContainer);

    
      setTimeout(() => {
        window.scrollTo({ top: scrollPosition, behavior: "instant" });
      }, 10);
    })
    .catch((error) => {
      console.error(`Error loading phase ${phaseId}:`, error);
      contentContainer.innerHTML = `
        <div class="error-message">
          <h3>Failed to load phase content</h3>
          <p>Please try again later or contact support if the problem persists.</p>
          <button onclick="loadPhaseContent('${phaseId}')">Retry</button>
        </div>
      `;

      
      setTimeout(() => {
        window.scrollTo({ top: scrollPosition, behavior: "instant" });
      }, 10);
    })
    .finally(() => {
      
      setTimeout(() => {
        contentContainer.style.minHeight = "";
      }, 300);
    });
}


function renderPhaseContent(phaseData, container) {
  
  container.innerHTML = "";

  
  const phaseDiv = document.createElement("div");
  phaseDiv.id = phaseData.id;
  phaseDiv.className = "phase-content active";

  
  phaseDiv.innerHTML = `
    <h2>${phaseData.title}</h2>
    <p>${phaseData.description}</p>
  `;

  
  if (phaseData.modules && phaseData.modules.length > 0) {
    phaseData.modules.forEach((module) => {
      const moduleDiv = document.createElement("div");
      moduleDiv.className = "module";

    
      const moduleHeader = document.createElement("div");
      moduleHeader.className = "module-header";
      moduleHeader.innerHTML = `
        <h3>${module.title}</h3>
        <span>+</span>
      `;

     
      moduleHeader.addEventListener("click", function () {
        const moduleBody = this.nextElementSibling;
        moduleBody.classList.toggle("expanded");

        
        const span = this.querySelector("span");
        span.textContent = span.textContent === "+" ? "-" : "+";
      });

      const moduleBody = document.createElement("div");
      moduleBody.className = "module-body";

      
      let moduleContent = "";

     
      if (module.topics && module.topics.length > 0) {
        moduleContent += `
          <h4>Topics:</h4>
          <ul class="topic-list">
            ${module.topics.map((topic) => `<li>${topic}</li>`).join("")}
          </ul>
        `;
      }

     
      if (module.practice && module.practice.length > 0) {
        moduleContent += `
          <h4>Practice:</h4>
          <ul class="practice-list">
            ${module.practice.map((item) => `<li>${item}</li>`).join("")}
          </ul>
        `;
      }

   
      if (module.timeCommitment) {
        moduleContent += `
          <div class="time-commitment">
            <h4>Daily Time Commitment:</h4>
            <p>Total: ${module.timeCommitment.total}</p>
            <ul>
              ${module.timeCommitment.breakdown
                .map((item) => `<li>${item}</li>`)
                .join("")}
            </ul>
          </div>
        `;
      }

      
      if (module.faangConnection) {
        moduleContent += `
          <h4>FAANG Connection:</h4>
          <p class="highlight">${module.faangConnection}</p>
        `;
      }

      
      if (module.companyFocus) {
        const companies = Object.keys(module.companyFocus);
        companies.forEach((company) => {
          moduleContent += `
            <h4>${company.charAt(0).toUpperCase() + company.slice(1)}:</h4>
            <ul class="company-list">
              ${module.companyFocus[company]
                .map((item) => `<li>${item}</li>`)
                .join("")}
            </ul>
          `;
        });
      }

    
      if (module.resources && module.resources.length > 0) {
        moduleContent += `
          <h4>Resources:</h4>
          <div class="resources">
            ${module.resources
              .map(
                (resource) => `
              <div class="resource-card">
                <div class="resource-icon">${resource.icon || "📚"}</div>
                <div>
                  <h5>${resource.title}</h5>
                  <p>${resource.description}</p>
                  ${
                    resource.link
                      ? `<a href="${
                          resource.link
                        }" target="_blank" rel="noopener noreferrer">
                      ${resource.linkText || "Link"}
                    </a>`
                      : ""
                  }
                </div>
              </div>
            `
              )
              .join("")}
          </div>
        `;
      }

      moduleBody.innerHTML = moduleContent;

      
      moduleDiv.appendChild(moduleHeader);
      moduleDiv.appendChild(moduleBody);

     
      phaseDiv.appendChild(moduleDiv);
    });
  } else {
    phaseDiv.innerHTML += "<p>No modules found for this phase.</p>";
  }

 
  container.appendChild(phaseDiv);
}


function showErrorMessage(message) {
  const contentContainer = document.getElementById("phase-content-container");
  contentContainer.innerHTML = `
    <div class="error-message">
      <h3>Error</h3>
      <p>${message}</p>
    </div>
  `;
}
