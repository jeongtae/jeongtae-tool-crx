(function main() {
  if (!isGitHubPage()) return;

  injectStyle();
})();

function injectStyle() {
  const style = document.createElement("style");
  style.id = "mintool-github-style";

  style.innerHTML = /* css */ `
    .pull-discussion-timeline a:visited:visited:visited[href*="commits"] {
      color: blueviolet;
    }
  `;

  document.head.appendChild(style);
}

function isGitHubPage() {
  return location.hostname === "github.com";
}
