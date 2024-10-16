(function main() {
  if (!isGitHubPage()) return;

  injectStyles();

  addAutoRefreshEvent();
  addNotificationFiltersAttachEvent();

  addNotificationFilters();
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

function addAutoRefreshEvent() {
  if (!(isPullsPage() || isNotificationPage())) return;

  if (document.body.dataset.autoRefreshEventBound) return;
  document.body.dataset.autoRefreshEventBound = true;

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) return;

    showToast("Page refreshed", 2000);
    refresh();
  });
}

function addNotificationFiltersAttachEvent() {
  if (!isNotificationPage()) return;

  if (document.body.dataset.notificationFiltersEventBound) return;
  document.body.dataset.notificationFiltersEventBound = true;

  document.addEventListener("turbo:render", () => {
    addNotificationFilters();
  });
}

async function addNotificationFilters() {
  if (!isNotificationPage()) return;

  await waitForDomLoaded();

  const filtersList = document.querySelector(
    "[aria-label='Filters'] .ActionListWrap"
  );

  const customFilters = [
    {
      selector: ".octicon-git-merge",
      emoji: "🟣",
      text: "Review merged",
    },
  ];

  customFilters.forEach((filter) => {
    const count = Array.from(document.querySelectorAll(filter.selector))
      .map((merged) => {
        return merged.closest(".notifications-list-item");
      })
      .filter(Boolean).length;

    if (!count) return;

    const id = `custom-filter-${selector}`;

    const currentFilter = filtersList.querySelector(`#${id}`);
    const newFilter = newFilterButton({
      selector: filter.selector,
      emoji: filter.emoji,
      text: filter.text,
      count,
    });

    if (currentFilter) {
      currentFilter.replaceWith(newFilter);
    } else {
      filtersList.appendChild(newFilter);
    }
  });
}

///////////////////////////////////////////////

function newFilterButton({
  selector,
  emoji = "💬",
  text = "new filter",
  count = 0,
} = {}) {
  if (!selector) throw new Error("[newFilterButton] selector is required");

  const id = `custom-filter-${selector}`;

  const newFilterButton = templateToElement(/* html */ `
      <button id=${id} data-view-component="true" class="ActionListContent">
        <span data-view-component="true" class="ActionListItem-label">
          ${emoji} ${text}
        </span>

        ${
          Boolean(count)
            ? `<span class="ActionListItem-visual ActionListItem-visual--trailing">
                <span title="${count}" data-view-component="true" class="Counter">${count}</span>
              </span>`
            : ""
        }
      </button>`);

  newFilterButton.addEventListener("click", () => {
    Array.from(document.querySelectorAll(".notifications-list-item")).forEach(
      (li) => {
        if (!li.querySelector(selector)) {
          li.remove();
        }
      }
    );
  });

  return newFilterButton;
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

function isNotificationPage() {
  return location.pathname.includes("/notifications");
}

async function waitForDomLoaded() {
  return new Promise((resolve) => {
    if (document.readyState === "complete") {
      resolve();
      return;
    }

    window.addEventListener("load", resolve);
  });
}
