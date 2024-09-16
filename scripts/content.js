const BLOCKED_LIST = [
  {
    selectors: [".spacing_log_question_page_ad"],
    origin: "https://www.quora.com/",
    command: "display: none",
  },
];

const COMMANDS = {
  "display: none": (element) => {
    element.style.display = "none";
  },
};

main();

function main() {
  execute();

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        execute();
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

function execute() {
  BLOCKED_LIST.forEach((blocked) => {
    if (blocked.origin && blocked.origin !== window.location.origin) {
      return;
    }

    document
      .querySelectorAll(blocked.selectors.join(","))
      .forEach((element) => {
        COMMANDS[blocked.command](element);
      });
  });
}
