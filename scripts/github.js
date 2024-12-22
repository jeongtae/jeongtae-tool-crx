(function main() {
  if (!isGitHubPage()) return;

  injectStyles();

  addNotificationFiltersAttachEvent();

  addNotificationFilters();

  /**************************************************/
  /*                                                */
  /* shortcut                                       */
  /*                                                */
  /**************************************************/
  addCommentShortcuts();

  addPullRequestCommitCopyShortcuts();

  addFillPullRequestTemplateShortcuts();
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

    const id = `custom-filter-${filter.selector}`;

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

function addCommentShortcuts() {
  let currentComment = null;
  const timeout = 10_000;

  const issueCommentClass = ".js-timeline-progressive-focus-container";
  const threeDotButtonClass = ".details-overlay";
  const editButtonClass = ".js-comment-edit-button";
  const cancelButtonClass = ".js-comment-cancel-button";

  const COMMANDS = {
    cmdShiftE: {
      keyPressed: (e) =>
        (e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "e",
      handler: (currentComment) => {
        const threeDotButton =
          currentComment.querySelector(threeDotButtonClass);
        if (!threeDotButton) return;

        threeDotButton.open = "true";
        const targetSelector = editButtonClass;

        waitForElement(threeDotButton, targetSelector, timeout).then(
          (element) => {
            element.click();
          }
        );
      },
    },
    esc: {
      keyPressed: (e) => e.key.toLowerCase() === "escape",
      handler: (currentComment) => {
        const threeDotButton =
          currentComment.querySelector(threeDotButtonClass);
        if (!threeDotButton) return;

        threeDotButton.open = "";

        const cancelButton = currentComment.querySelector(cancelButtonClass);
        if (!cancelButton) return;

        cancelButton.click();
      },
    },
  };

  document.addEventListener("click", (e) => {
    const comment = e.target.closest(issueCommentClass);
    if (!comment) return;

    currentComment = comment;
    glow(currentComment);
  });

  document.addEventListener("keydown", (e) => {
    if (!currentComment) return;

    const command = Object.entries(COMMANDS).find(([_, cmd]) =>
      cmd.keyPressed(e)
    );
    if (!command) return;

    const [_, { handler }] = command;
    handler(currentComment);
  });

  function glow(element) {
    setTimeout(() => {
      element.style.transition = "box-shadow 0.3s ease-in-out";
      element.style.boxShadow = "0 0 8px 2px blueviolet";

      setTimeout(() => {
        element.style.boxShadow = "0 0 0 0 blueviolet";

        // Clean up styles after animation
        setTimeout(() => {
          element.style.transition = "";
          element.style.boxShadow = "";
        }, 300);
      }, 900);
    }, 0);
  }
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

function addPullRequestCommitCopyShortcuts() {
  addEventListener("keydown", (e) => {
    if (
      !(e.metaKey && e.shiftKey && e.altKey && e.key === "Ç") ||
      (!/^\/grepp\/[^/]+\/pull\/\d+$/.test(location.pathname) &&
        !/^\/grepp\/[^/]+\/compare\/[^/]+$/.test(location.pathname))
    ) {
      return;
    }

    e.preventDefault();

    navigator.clipboard.writeText(
      Array.from(
        document.querySelectorAll(
          '.Link--primary[href*="/commit/"],.Link--secondary[href*="/commits/"][title]'
        )
      )
        .filter((el) => !el.textContent.startsWith("Merge branch"))
        .map((el, idx) => `${idx + 1}. **[${el.textContent}](${el.href})**`)
        .join("\n\n    .\n\n")
    );

    alert("커밋 링크 복사완료");
  });
}

const REVIEWERS = [
  "arclien",
  "Beomjun",
  "bobyunki",
  "datalater",
  "ghyeon0",
  "shinkeonkim",
  "theo-song",
];
function addFillPullRequestTemplateShortcuts() {
  addEventListener("keydown", async (e) => {
    if (
      !(e.metaKey && e.shiftKey && e.altKey && e.key === "˛") ||
      !/^\/grepp\/[^/]+\/compare\/[^/]+$/.test(location.pathname) ||
      !confirm("풀 리퀘스트 템플릿을 채우시겠습니까?")
    ) {
      return;
    }

    e.preventDefault();

    const ticketNumber = location.pathname.match(/(?<=\.\.\.)\w+-\d+/)[0];

    // PR 제목 바꾸기
    const titleInput = document.querySelector(".discussion-topic-header input");
    titleInput.value = titleInput.value.replace(/^[A-Z][a-z]{2,} \d+/, `[${ticketNumber}]`);

    // Reviewers 열기
    document.querySelector('#reviewers-select-menu [role="button"]').click();
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 리뷰어 모두 선택
    Array.from(document.querySelectorAll('#reviewers-select-menu [role="menuitemcheckbox"]'))
      .filter((el) => REVIEWERS.includes(el.querySelector(".js-username").textContent))
      .forEach((el) => {
        el.click();
      });

    // 어사이니 선택
    document.querySelector(".js-issue-assign-self")?.click();
  });
}
