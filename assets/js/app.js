// Fetch github projects
const username = "zuekiin";
const wanted = [
  "weather_app_react",
  "projekt-bucket-list",
  "card_animation",
  "local-ai-brick-breaker",
  "star_wars",
  "projekt-js-individuellt",
];

const CACHE_KEY = "portfolio_repos";
const TTL = 1000 * 60 * 60 * 6;

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.data || !parsed.ts) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
  } catch (e) {
    console.warn("Failed to write cache", e);
  }
}

// Fetch
async function fetchProjects() {
  const cached = readCache();
  if (cached && Date.now() - cached.ts < TTL) {
    console.log("Cache hit — using localStorage");
    return cached.data;
  }

  console.log("Cache miss — fetching from GitHub");
  try {
    const res = await fetch(`https://api.github.com/users/${username}/repos`);

    if (!res.ok) {
      // 403 / rate limited, fall back to stale cache if any
      if (cached) {
        console.warn(`Fetch failed (${res.status}) — using stale cache`);
        return cached.data;
      }
      throw new Error(`GitHub API: ${res.status}`);
    }

    const repos = await res.json();
    const selected = repos.filter((r) => wanted.includes(r.name));

    if (selected.length === 0) {
      throw new Error("GitHub returned no matching repos");
    }

    const langResults = await Promise.all(
      selected.map((repo) =>
        fetch(`https://api.github.com/repos/${username}/${repo.name}/languages`)
          .then((r) => (r.ok ? r.json() : {}))
          .catch(() => ({})),
      ),
    );

    const data = selected.map((repo, i) => ({
      name: repo.name,
      url: repo.html_url,
      description: repo.description || "No description",
      languages: Object.keys(langResults[i]),
    }));

    writeCache(data);
    return data;
  } catch (err) {
    // Network error, stale cache fallback
    if (cached) {
      console.warn("Fetch error — using stale cache", err);
      return cached.data;
    }
    // No cache at all, tell the user
    console.warn("Fetch failed and no cache:", err);
    showErrorModal();
    throw err;
  }
}

function renderErrorCards(count = 6) {
  const container = document.getElementById("article-cards");
  if (!container) return;

  container.innerHTML = "";

  for (let i = 0; i < count; i++) {
    const article = document.createElement("article");
    article.classList.add("card-error");

    article.innerHTML = `
      <figure>
        <div class="card-error-img" aria-hidden="true"></div>
      </figure>

      <div class="article-content">
        <header>
          <h3>Projects unavailable</h3>
        </header>

        <p>Couldn't load project data from the server. Please try again later.</p>

        <p class="card-stack"><span>Tech Stack: </span>—</p>

        <footer>
          <div>
            <i class="fa-solid fa-link"></i>
            <span>Live Preview</span>
          </div>
          <div>
            <i class="fa-brands fa-github"></i>
            <span>View Code</span>
          </div>
        </footer>
      </div>
    `;

    container.appendChild(article);
  }
}

fetchProjects()
  .then((data) => {
    console.log("Got data:", data);
    renderCards(data);
  })
  .catch((err) => {
    console.error("Failed:", err);
    renderErrorCards(wanted.length);
  });

// Popup Modal
function showErrorModal() {
  const modal = document.getElementById("error-modal");
  if (!modal) return;
  modal.hidden = false;

  const close = () => {
    modal.hidden = true;
    document.removeEventListener("keydown", onKey);
  };
  const onKey = (e) => {
    if (e.key === "Escape") close();
  };

  modal.querySelectorAll("[data-close]").forEach((el) => {
    el.addEventListener("click", close, { once: true });
  });
  document.addEventListener("keydown", onKey);
}

function prettifyName(name) {
  return name.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// Render github projects
const IMAGE_URL =
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1364&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

function renderCards(projects) {
  const container = document.getElementById("article-cards");
  if (!container) return;

  container.innerHTML = ""; // clear before rendering

  projects.forEach((project) => {
    const article = document.createElement("article");

    article.innerHTML = `
      <figure>
        <img src="${IMAGE_URL}" width="564" height="603" alt="${project.name}" />
      </figure>

      <div class="article-content">
        <header>
          <h3>${prettifyName(project.name)}</h3>
        </header>

        <p>${project.description}</p>

        <p class="card-stack">
          <span>Tech Stack: </span>${project.languages.join(", ") || "—"}
        </p>

        <footer>
          <div>
            <i class="fa-solid fa-link"></i>
            <a href="${project.url}" target="_blank" rel="noopener noreferrer">Live Preview</a>
          </div>
          <div>
            <i class="fa-brands fa-github"></i>
            <a href="${project.url}" target="_blank" rel="noopener noreferrer">View Code</a>
          </div>
        </footer>
      </div>
    `;

    container.appendChild(article);
  });
}

// Interactive nav
function showhide() {
  const navBtn = document.querySelector(".hamburger-btn");
  const navContainer = document.querySelector(".nav-container");

  navBtn.addEventListener("click", () => {
    const isOpen = navContainer.classList.toggle("is-open");
    navBtn.classList.toggle("is-open", isOpen);
    navBtn.setAttribute("aria-expanded", String(isOpen));
  });

  navContainer.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navContainer.classList.remove("is-open");
      navBtn.classList.remove("is-open");
      navBtn.setAttribute("aria-expanded", "false");
    });
  });
}

showhide();

// Switch light/dark mode
if (localStorage.getItem("theme") === "dark") {
  document.documentElement.classList.add("dark-mode");
}

const toggle = document.getElementById("toggleMode");

if (toggle) {
  toggle.checked = document.documentElement.classList.contains("dark-mode");

  toggle.addEventListener("change", () => {
    const isDark = toggle.checked;
    document.documentElement.classList.toggle("dark-mode", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  });
}

// Resume data
fetch("./data/resume.json")
  .then((res) => res.json())
  .then((data) => {
    renderHero(data.hero);
    renderSocialLinks(data.socialLinks);
    renderAbout(data.about);
    renderExperience(data.experience);
    renderEducation(data.education);
  })
  .catch((err) => console.error("Failed to load resume:", err));

function renderHero(hero) {
  const el = document.querySelector(".hero-section span");
  el.innerHTML = `
  <span class="heading-gradient">${hero.name}</span>
  `;

  const img = document.querySelector(".hero-section .img-wrapper");
  img.src = hero.profileImage;
  img.alt = hero.profileImageAlt;
  img.width = hero.profileImageWidth;
  img.height = hero.profileImageHeight;
}

function renderSocialLinks(links) {
  const ul = document.querySelector(".social-links ul");
  ul.innerHTML = links
    .map(
      (link) =>
        `
        <li>
          <a href="${link.url}" target="_blank" aria-label="${link.ariaLabel}">
            <i class="${link.icon}"></i>
          </a>
        </li>
        `,
    )
    .join("");
}

function renderAbout(about) {
  const section = document.querySelector("#about");
  section.querySelector("p").textContent = about.summary;
}

function renderExperience(experience) {
  const container = document.querySelector("#about .experience-list");
  if (!container) return;

  container.innerHTML = experience
    .map(
      (job) => `
        <article class="card-about">
            <div class="card-content">
                <h4>${job.role}</h4>
                <span>${job.type}</span>
            </div>
            <div class="card-content">
                <div>
                    <div class="grid-align">
                        <p><i class="fa-regular fa-building"></i> ${job.company}</p>
                        <p><i class="fa-regular fa-compass"></i> ${job.location}</p>
                    </div>
                </div>
                    <p>
                        <i class="fa-regular fa-calendar-days"></i>
                        <time datetime="${job.startDateTime}">${job.startDate}</time> –
                        <time datetime="${job.endDateTime}">${job.endDate}</time>
                    </p>
            </div>
        </article>`,
    )
    .join("");
}

function renderEducation(education) {
  const container = document.querySelector("#about .education-list");
  if (!container) return;

  container.innerHTML = education
    .map(
      (edu) => `
        <article class="card-about">
          <div class="card-content">
            <h4>${edu.degree}</h4>
            <span>${edu.type}</span>
          </div>

          <div class="card-content">
            <p>
              <i class="fa-regular fa-building"></i> ${edu.institution}
            </p>

            <p>
              <i class="fa-regular fa-calendar-days"></i>
              <time datetime="${edu.startDateTime}">${edu.startDate}</time> -
              <time datetime="${edu.endDateTime}">${edu.endDate}</time>
            </p>
          </div>
        </article>`,
    )
    .join("");
}

// Scroll spy update URL hash to the section in view
const sections = document.querySelectorAll("section[id]");

function setActive(id) {
  if (location.hash !== `#${id}`) {
    history.replaceState(null, "", `#${id}`);
  }
  document.querySelectorAll(".nav-links a").forEach((a) => {
    a.classList.toggle("is-active", a.getAttribute("href") === `#${id}`);
  });
}

if (sections.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

      if (visible.length) {
        setActive(visible[0].target.id);
      }
    },
    {
      rootMargin: "-40% 0px -55% 0px",
      threshold: 0,
    },
  );

  sections.forEach((s) => observer.observe(s));

  // Force #home when scrolled near the top
  window.addEventListener(
    "scroll",
    () => {
      if (window.scrollY < 100) setActive("home");
    },
    { passive: true },
  );

  // Set correct state on first load (e.g. reloading at #about)
  if (window.scrollY < 100) setActive("home");
}
