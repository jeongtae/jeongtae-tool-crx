function waitForElement(root, selector, timeout = 1000) {
  return new Promise((resolve, reject) => {
    const element = root.querySelector(selector);
    if (element) {
      resolve(element);
    }

    root.querySelectorAll("*").forEach((node) => {
      if (node.shadowRoot) {
        const shadowElement = node.shadowRoot.querySelector(selector);
        if (shadowElement) {
          resolve(shadowElement);
        }
      }
    });

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (!(node instanceof Element)) return;

            if (node.matches(selector)) {
              observer.disconnect();
              clearTimeout(timeoutId);
              resolve(node);
            }

            if (node.shadowRoot) {
              const shadowElement = node.shadowRoot.querySelector(selector);
              if (shadowElement) {
                observer.disconnect();
                clearTimeout(timeoutId);
                resolve(shadowElement);
              }

              observer.observe(node.shadowRoot, {
                childList: true,
                subtree: true,
              });
            }
          });
        }
      });
    });

    observer.observe(root, { childList: true, subtree: true });

    root.querySelectorAll("*").forEach((node) => {
      if (node.shadowRoot) {
        observer.observe(node.shadowRoot, { childList: true, subtree: true });
      }
    });

    const timeoutId = setTimeout(() => {
      observer.disconnect();
      reject(new Error(`[waitForElement] Element not found in ${timeout}ms`));
    }, timeout);
  });
}
