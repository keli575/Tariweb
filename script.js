const buttons = Array.from(document.querySelectorAll('[data-slide-button]'));
const panels = Array.from(document.querySelectorAll('[data-slide-panel]'));

function getActiveButton(name) {
    return buttons.find((button) => button.dataset.slideButton === name) ?? buttons[0];
}

function positionBubbleTail(panel) {
    if (!panel) {
        return;
    }

    const activeName = panel.dataset.slidePanel;
    const button = getActiveButton(activeName);
    const card = panel.querySelector('.speech-card');

    if (!button || !card) {
        return;
    }

    const buttonRect = button.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const tailLeft = buttonRect.left + buttonRect.width / 2 - cardRect.left;
    const clampedTailLeft = Math.max(24, Math.min(cardRect.width - 24, tailLeft));

    panel.style.setProperty('--tail-left', `${clampedTailLeft}px`);
}

function refreshBubbleTail() {
    const activePanel = panels.find((panel) => panel.classList.contains('is-active')) ?? panels[0];
    positionBubbleTail(activePanel);
}

function setActiveSlide(name, { pushHistory = true } = {}) {
    const targetPanel = panels.find((panel) => panel.dataset.slidePanel === name) ?? panels[0];

    if (!targetPanel) {
        return;
    }

    const activeName = targetPanel.dataset.slidePanel;

    buttons.forEach((button) => {
        const isActive = button.dataset.slideButton === activeName;
        button.classList.toggle('is-active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
    });

    panels.forEach((panel) => {
        const isActive = panel === targetPanel;
        panel.classList.toggle('is-active', isActive);
        panel.setAttribute('aria-hidden', String(!isActive));
    });

    window.requestAnimationFrame(() => {
        positionBubbleTail(targetPanel);
    });

    if (pushHistory && location.hash !== `#${activeName}`) {
        history.pushState({ slide: activeName }, '', `#${activeName}`);
    }
}

function syncFromHash() {
    const requestedName = location.hash.replace('#', '');
    const validName = panels.some((panel) => panel.dataset.slidePanel === requestedName)
        ? requestedName
        : (panels[0]?.dataset.slidePanel ?? 'about');

    setActiveSlide(validName, { pushHistory: false });

    if (!requestedName || requestedName !== validName) {
        history.replaceState({ slide: validName }, '', `#${validName}`);
    }
}

buttons.forEach((button) => {
    button.addEventListener('click', () => {
        setActiveSlide(button.dataset.slideButton);
    });
});

window.addEventListener('hashchange', syncFromHash);
window.addEventListener('popstate', syncFromHash);
window.addEventListener('resize', refreshBubbleTail);

if (document.fonts?.ready) {
    document.fonts.ready.then(refreshBubbleTail).catch(() => {});
}

syncFromHash();
