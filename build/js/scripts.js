const images = "assets/startrack/";
const versions = {
  Lite: {
    feature: "Фиксированные рукоятки",
    description: "Две боковые ручки расположены на уровне ладоней и перпендикулярны спинке. Спереди остаётся открытый проём для входа.",
    note: "Проём между рукоятками 580 мм",
    image: "lite-studio.webp"
  },
  Pro: {
    feature: "Регулируемая опора для рук",
    description: "В узком положении подушки почти вплотную подходят к спинке. Каждую опору можно поднять или отодвинуть вбок вместе с рукояткой.",
    note: "Проём между подушками 437–680 мм",
    image: "pro-studio-d.webp"
  },
  X: {
    feature: "Два положения подлокотников",
    description: "Локти можно держать близко к телу, а при необходимости раздвинуть опоры вместе с джойстиками. Для отдыха каждый подлокотник отдельно опускается вдоль спинки.",
    note: "Управление · проём 437–655 мм",
    image: "x-work-d.webp"
  }
};

const versionButtons = document.querySelectorAll("[data-model]");
const poseButtons = document.querySelectorAll("[data-pose]");
const modelImage = document.getElementById("model-image");
const modelNote = document.getElementById("model-note");
const poseControl = document.querySelector(".pose-switch");

function showPose(pose) {
  const resting = pose === "rest";
  modelImage.src = images + (resting ? "x-rest-d.webp" : versions.X.image);
  modelImage.alt = resting ? "Startrack X с опущенными вдоль спинки подлокотниками." : "Startrack X с двумя подлокотниками в рабочем положении и джойстиками у ладоней.";
  modelNote.textContent = resting ? "Отдых · проём 437–655 мм" : versions.X.note;
  for (const button of poseButtons) {
    button.setAttribute("aria-pressed", String(button.dataset.pose === pose));
  }
}

function selectVersion(model) {
  const data = versions[model];
  document.getElementById("model-name").textContent = "Startrack " + model;
  document.getElementById("version-feature").textContent = data.feature;
  document.getElementById("version-description").textContent = data.description;
  poseControl.hidden = model !== "X";
  if (model === "X") {
    showPose("work");
  } else {
    modelImage.src = images + data.image;
    modelImage.alt = "Трёхмерная сборка Startrack " + model + " в ракурсе три четверти.";
    modelNote.textContent = data.note;
  }
  const link = document.getElementById("version-request");
  link.href = "testing.html?model=" + model;
  link.firstChild.textContent = "На тестирование " + model + " ";
  for (const button of versionButtons) {
    button.setAttribute("aria-pressed", String(button.dataset.model === model));
  }
}
for (const button of versionButtons) {
  button.addEventListener("click", () => selectVersion(button.dataset.model));
}
for (const button of poseButtons) {
  button.addEventListener("click", () => showPose(button.dataset.pose));
}

const home = document.querySelector(".hero");
if (home) {
  const links = Array.from(document.querySelectorAll('.dock a[href^="#"]'));
  const sections = links.map(link => link.hash === "#top" ? home : document.querySelector(link.hash));
  const invitation = document.querySelector(".invitation");
  let scheduled = false;
  function updateCurrentSection() {
    const threshold = Math.min(window.innerHeight * 0.36, 260);
    let active = 0;
    for (let i = 1; i < sections.length; i++) {
      if (sections[i].getBoundingClientRect().top <= threshold) active = i;
    }
    if (invitation.getBoundingClientRect().top <= threshold) active = -1;
    links.forEach((link, index) => {
      if (index === active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
    scheduled = false;
  }
  function scheduleUpdate() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(updateCurrentSection);
  }
  addEventListener("scroll", scheduleUpdate, {passive: true});
  addEventListener("resize", scheduleUpdate);
  addEventListener("pageshow", scheduleUpdate);
  updateCurrentSection();
}

const form = document.getElementById("request-form");
if (form) {
  const selected = new URLSearchParams(location.search).get("model");
  if (Object.hasOwn(versions, selected)) form.elements.model.value = selected;
  const photo = document.querySelector(".request-photo");
  const photoImage = photo.querySelector("img");
  function updateRequestPhoto() {
    const model = form.elements.model.value;
    const pictured = Object.hasOwn(versions, model) ? model : "X";
    const asset = {Lite: "lite-studio.webp", Pro: "pro-front-portrait-d.webp", X: "x-studio-photo-d.webp"}[pictured];
    photoImage.src = images + asset;
    photoImage.alt = "Визуализация прототипа Startrack " + pictured + ".";
    photo.classList.toggle("studio-view", pictured === "Lite");
    document.getElementById("request-photo-model").textContent = "Startrack " + pictured;
  }
  form.addEventListener("change", event => {
    if (event.target.name === "model") updateRequestPhoto();
  });
  updateRequestPhoto();
  const panel = document.getElementById("draft-panel");
  const status = document.getElementById("draft-status");
  const draft = document.getElementById("draft-text");
  const reopen = document.getElementById("reopen-draft");
  form.addEventListener("input", () => { panel.hidden = true; draft.hidden = true; });
  form.addEventListener("submit", event => {
    event.preventDefault();
    const data = new FormData(form);
    const name = data.get("name").trim();
    const city = data.get("city").trim();
    const model = data.get("model");
    const body = [
      "Здравствуйте! Хочу принять участие в тестировании Startrack.",
      "", "Имя: " + name, "Город: " + city, "Версия стойки: " + model,
      "", "Прошу сообщить, когда можно будет попробовать прототип."
    ].join("\r\n");
    const subject = "Запрос на тестирование Startrack" + (model === "Любая" ? "" : " " + model);
    const address = "mailto:support@mukashov.com?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    draft.value = body;
    draft.hidden = true;
    reopen.href = address;
    status.textContent = "Черновик готов. Если почта не открылась, скопируйте запрос и отправьте его на support@mukashov.com.";
    panel.hidden = false;
    window.location.href = address;
  });
  document.getElementById("copy-draft").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(draft.value);
      status.textContent = "Текст запроса скопирован. Отправьте его на support@mukashov.com.";
    } catch {
      draft.hidden = false;
      draft.focus();
      draft.select();
      status.textContent = "Текст запроса выделен. Скопируйте его и отправьте на support@mukashov.com.";
    }
  });
}
