const PROJECT_PREFIX = "mintool";
const Z_INDEX_MAX = 2147483647;
const Z_INDEX_TOAST = Z_INDEX_MAX - 1;
const overlayMargin = "20px";
const overlayPadding = "8px 16px";

function showToast(text, duration = 2000) {
  if (document.querySelector(`.${PROJECT_PREFIX}-toast`)) {
    document.querySelector(`.${PROJECT_PREFIX}-toast`).remove();
  }

  return new Promise((resolve) => {
    const toast = createIsland({
      zIndex: Z_INDEX_TOAST,
      opacity: 0,
      transition: "opacity 0.3s ease-in-out",
    });
    toast.classList.add(`${PROJECT_PREFIX}-toast`);
    toast.innerHTML = text;

    toast.addEventListener(
      "transitionend",
      () => {
        resolve();
      },
      { once: true }
    );

    // 토스트 요소를 서서히 나타나게 함
    setTimeout(() => {
      toast.style.opacity = "1";
    }, 100);

    // duration 이후에 토스트 요소를 서서히 사라지게 함
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, duration);
  });
}

function createIsland(styleProps = {}) {
  const element = document.createElement("div");
  element.classList.add(`${PROJECT_PREFIX}-island`);
  element.style.position = "fixed";
  element.style.top = overlayMargin;
  element.style.left = "50%";
  element.style.transform = "translateX(-50%)";
  element.style.textAlign = "center";
  element.style.padding = overlayPadding;
  element.style.backgroundColor = "rgba(0, 0, 0, 1)";
  element.style.outline = "1px solid #fff";
  element.style.color = "#fff";
  element.style.borderRadius = "4px";
  element.style.fontSize = "16px";
  element.style.lineHeight = "1.4";
  Object.assign(element.style, styleProps);

  document.body.appendChild(element);

  const style = document.createElement("style");
  style.id = `${PROJECT_PREFIX}-island-style`;
  style.textContent = `
    .${PROJECT_PREFIX}-island {
      @media (max-width: 768px) {
        width: calc(100% - 20px);
        font-size: 14px;
      }
    }
  `;
  document.head.appendChild(style);

  return element;
}

Object.assign(window, {
  showToast,
});
