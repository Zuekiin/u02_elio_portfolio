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
}

function renderSocialLinks(links) {
  const ul = document.querySelector(".social-links ul");
  ul.innerHTML = links
    .map(
      (link) =>
        `
        <li>
          <a href="${link.url}" aria-label="${link.ariaLabel}">
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
  const container = document.querySelector("#about section");
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
