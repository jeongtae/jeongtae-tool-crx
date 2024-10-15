(function main() {
  if (!isGitHubPage()) return;

  injectStyles();
  bindEvents();
})();

function injectStyles() {
  const style = document.createElement("style");
  style.id = "mintool-github-style";

  style.innerHTML = /* css */ `
    .pull-discussion-timeline a:visited:visited:visited[href*="commits"] {
      color: blueviolet;
    }
  `;

  document.head.appendChild(style);
}

function bindEvents() {
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) return;

    if (isPullsPage()) {
      refresh();
    }
  });
}

function refresh() {
  location.reload();
}

function isGitHubPage() {
  return location.hostname === "github.com";
}

function isPullsPage() {
  return location.pathname.includes("/pulls");
}
