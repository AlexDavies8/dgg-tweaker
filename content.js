// SETTINGS

const VERSION = chrome.runtime.getManifest().version;

const INPUT_TYPES = {
    CHECKBOX: Symbol('checkbox'),
    NUMBER_FIELD: Symbol('number_field'),
    SELECT: Symbol('select'),
    BUTTON: Symbol('button')
}
const settingsMenuDef = [
    {
        heading: "Chat",
        subheading: "Settings that affect DGG Chat (including embeds)",
        fields: [
            [INPUT_TYPES.CHECKBOX, 'inline-rustlesearch', "Inline RustleSearch", "Show rustlesearch logs directly in user right click info menu"],
            [INPUT_TYPES.CHECKBOX, 'inline-force-timestamps', "Force RustleSearch Timestamps", "Always show timestamps for inline logs from rustlesearch"],
            [INPUT_TYPES.CHECKBOX, 'resize-user-info', "Resizable User Info", "Allow for resizing the user right click info menu"],
            [INPUT_TYPES.CHECKBOX, 'mentions-button', "Mentions Button", "Adds a button to the bottom of chat to view recent mentions"],
            [INPUT_TYPES.CHECKBOX, 'mentions-force-timestamps', "Force Mentions Timestamps", "Always show timestamps for mentions"],
            [INPUT_TYPES.NUMBER_FIELD, 'link-size', "Link Size", 'Increase the clickable area for links (no visual change)', "1.00", 1.00],
            [INPUT_TYPES.CHECKBOX, 'link-size-debug', "Visualise Link Size", "Show an outline around the clickable area (debug option)"],
            [INPUT_TYPES.SELECT, 'aggregate-links-button', "'Aggregate Links' Button", "Mode for a new 'Aggregate Links' button in chat", [['off', 'Disabled'], ['link', 'Links Only'], ['name', 'Include Usernames'], ['full', 'Full Messages']]],
        ]
    },
    {
        heading: "Big Screen",
        subheading: "Settings that affect the Big Screen",
        fields: [
            [INPUT_TYPES.CHECKBOX, 'bigscreen-menubar', "Cinema Mode Menu Bar", "Slide out the menu bar on hover while in Cinema Mode"],
            [INPUT_TYPES.CHECKBOX, 'bigscreen-controls', "Cinema Mode Controls", "Slide out the bottom stream controls on hover while in Cinema Mode"],
            [INPUT_TYPES.CHECKBOX, 'dgg-layout-fix', "DGG Layout Fix Script", "DGG Layout Fix script from chatter_here. Overrides the options above"],
        ]
    },
    {
        heading: "Other",
        subheading: "Miscellaneous settings",
        fields: [
            [INPUT_TYPES.CHECKBOX, 'show-changelogs', "Show changelogs", "Display changelogs whenever this extension is updated"],
            [INPUT_TYPES.BUTTON, 'show-changelogs-button', "Version History", "Click to open full historical changelogs", "Open", () => showChangelogDialog("0.0", VERSION)],
        ]
    }
];

let settings = {
    'show-changelogs': true,
    'bigscreen-menubar': true,
    'bigscreen-controls': false,
    'link-size': 1.00,
    'link-size-debug': false,
    'aggregate-links-button': 'off',
    'inline-rustlesearch': true,
    'inline-force-timestamps': false,
    'resize-user-info': true,
    'dgg-layout-fix': false,
    'mentions-button': true,
    'mentions-force-timestamps': false
};

function changeSetting(key, value) {
    settings[key] = value;
    chrome.storage.sync.set({ settings });
    onSettingsChanged();
}

async function loadSettings() {
    const loaded = (await chrome.storage.sync.get('settings')).settings;
    settings = Object.assign(settings, loaded);
}

// PAGE TYPES

const PAGE_TYPES = {
    BIGSCREEN: Symbol('bigscreen'),
    CHAT: Symbol('chat'),
    SETTINGS: Symbol('settings'),
    DEFAULT: Symbol('default')
};
const PAGE_TYPE = getPageType();

function getPageType() {
    var path = window.location.pathname;

    if (path === '/bigscreen') return PAGE_TYPES.BIGSCREEN;
    if (path === '/embed/chat') return PAGE_TYPES.CHAT;
    if (path.startsWith('/profile')) return PAGE_TYPES.SETTINGS;

    return PAGE_TYPES.DEFAULT;
}

// UI ELEMENTS
const CHAT_UI = {
    [INPUT_TYPES.CHECKBOX]: (key, label, description) => el('div', { classes: ['form-group', 'checkbox', 'dgg-tweaks-setting'], id: 'dgg-tweaks-' + key },
        el('label', { title: description, for: 'dgg-tweaks-' + key },
            el('input', {
                name: 'dgg-tweaks-' + key,
                type: 'checkbox',
                checked: settings[key],
                events: { change: e => changeSetting(key, e.target.checked) }
            }),
            label
        )
    ),
    [INPUT_TYPES.NUMBER_FIELD]: (key, label, description, placeholder, min = undefined, max = undefined) => el('div', { classes: ['form-group', 'dgg-tweaks-setting'], id: 'dgg-tweaks-' + key },
        el('label', { title: description, for: 'dgg-tweaks-' + key }, label),
        el('input', {
            classes: ['form-control'],
            type: 'number',
            name: 'dgg-tweaks-' + key,
            value: settings[key],
            min,
            max,
            placeholder,
            events: {
                change: e => changeSetting(key, parseFloat(e.target.value))
            }
        })
    ),
    [INPUT_TYPES.SELECT]: (key, label, description, options) => el('div', { classes: ['form-group', 'dgg-tweaks-setting'], id: 'dgg-tweaks-' + key },
        el('label', { title: description, for: 'dgg-tweaks-' + key }, label),
        el('select', {
            classes: ['form-control'],
            name: 'dgg-tweaks-' + key,
            events: {
                change: e => changeSetting(key, e.target.value)
            }
        }, ...options.map(option => el('option', { value: option[0], selected: option[0] === settings[key] ? true : undefined }, option[1])))
    )
}

const PROFILE_UI = {
    [INPUT_TYPES.CHECKBOX]: (key, label, description) => el('div', { classes: ['user-info__section', 'dgg-tweaks-setting'], id: 'dgg-tweaks-' + key },
        el('label', { classes: ['user-info__label'], for: 'dgg-tweaks-' + key }, label),
        el('div', { classes: ['user-info__hint'] }, description),
        el('div', { classes: ['user-info__field'] },
            el('input', {
                type: 'checkbox',
                name: 'dgg-tweaks-' + key,
                checked: settings[key],
                events: { change: e => changeSetting(key, e.target.checked) }
            })
        )
    ),
    [INPUT_TYPES.NUMBER_FIELD]: (key, label, description, placeholder, min = undefined, max = undefined) => el('div', { classes: ['user-info__section', 'dgg-tweaks-setting'], id: 'dgg-tweaks-' + key },
        el('label', { classes: ['user-info__label'], for: 'dgg-tweaks-' + key }, label),
        el('div', { classes: ['user-info__hint'] }, description),
        el('div', { classes: ['user-info__field'] },
            el('div', { classes: ['input'] },
                el('div', { classes: ['input__area'] },
                    el('div', { classes: ['input__container'] },
                        el('input', {
                            type: 'number',
                            name: 'dgg-tweaks-' + key,
                            value: settings[key],
                            min,
                            max,
                            placeholder,
                            events: {
                                change: e => changeSetting(key, parseFloat(e.target.value))
                            }
                        })
                    )
                )
            )
        )
    ),
    [INPUT_TYPES.BUTTON]: (key, label, description, buttonText, click) => el('div', { classes: ['user-info__section', 'dgg-tweaks-setting'], id: 'dgg-tweaks-' + key },
        el('label', { classes: ['user-info__label'], for: 'dgg-tweaks-' + key }, label),
        el('div', { classes: ['user-info__hint'] }, description),
        el('div', { classes: ['user-info__field'] },
            el('input', {
                type: 'button',
                name: 'dgg-tweaks-' + key,
                classes: ['button', 'button--secondary'],
                events: { click },
                value: buttonText
            })
        )
    ),
    [INPUT_TYPES.SELECT]: (key, label, description, options) => el('div', { classes: ['user-info__section', 'dgg-tweaks-setting'], id: 'dgg-tweaks-' + key },
        el('label', { classes: ['user-info__label'], for: 'dgg-tweaks-' + key }, label),
        el('div', { classes: ['user-info__hint'] }, description),
        el('div', { classes: ['user-info__field'] },
            el('div', { classes: ['input'] },
                el('div', { classes: ['input__area'] },
                    el('div', { classes: ['input__container'] },
                        el('select', {
                            classes: ['form-control'],
                            name: 'dgg-tweaks-' + key,
                            events: {
                                change: e => changeSetting(key, e.target.value)
                            }
                        }, ...options.map(option => el('option', { value: option[0], selected: option[0] === settings[key] ? true : undefined }, option[1])))
                    )
                )
            )
        )
    ),
}

function renderField(context, field) {
    const [fieldType, ...args] = field;
    return context[fieldType](...args);
}

function chatSettingsMenu() {
    const chatDef = settingsMenuDef.find(section => section.heading === 'Chat');

    const menu = el('div', { id: 'dgg-tweaks-settings' },
        el('h4', {}, "DGG Tweaks"),
        ...chatDef.fields.map(field => renderField(CHAT_UI, field))
    ).build();

    document.getElementById('chat-settings-form').appendChild(menu);
}

function profileSettingsMenu() {
    const heading = (heading, subheading) => el('div', { classes: ['profile-heading'] },
        el('h2', { classes: ['profile-heading__title'] }, heading),
        el('span', { classes: ['profile-heading__subtitle'] }, subheading),
    );

    const menu = el('div', { classes: ['profile-content'] },
        settingsMenuDef.map(section => el('section', {},
            heading(section.heading, section.subheading),
            ...section.fields.map(field => renderField(PROFILE_UI, field))
        ))
    ).build();

    document.querySelector('.profile-content').replaceWith(menu);
}

function profileSettingsNavbar() {
    const active = window.location.search === '?dgg-tweaks';

    if (active) document.querySelector('.tab.tab--active').classList.remove('tab--active');

    const navItem = el('li', { classes: active ? ['tab', 'tab--active'] : ['tab'] },
        el('a', { classes: ['tab__link'], href: '/profile/?dgg-tweaks' }, "DGG Tweaks")
    ).build();

    document.querySelector('.tabs.tabs--vertical').appendChild(navItem);
}

function globalNavbarSettingsButton() {
    const item = el('li', { classList: ['dropdown__item'] },
        el('a', { classList: ['dropdown__link'], href: '/profile/?dgg-tweaks' },
            fromHTMLString(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-wrench"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`),
            " DGG Tweaks"
        )
    ).build();
    document
        .querySelector('.navbar__actions')
        .querySelector('ul.dropdown')
        .querySelector('hr')
        .before(item);
}

// CHANGELOGS

async function loadChangelogFile() {
    return fetch(chrome.runtime.getURL('changelogs.json')).then(res => res.json());
}

function compareVersions(a, b) {
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

async function showChangelogDialog(fromVersion, toVersion, autoPopup = false) {
    if (fromVersion !== toVersion) {
        const changelogs = await loadChangelogFile();
        const description = Object.entries(changelogs)
            .filter(entry => compareVersions(String(entry[0]), fromVersion) > 0)
            .filter(entry => compareVersions(String(entry[0]), toVersion) < 1)
            .reverse()
            .map(entry => [entry[0], el('p', {}, fromHTMLString(entry[1]))])
            .map(([k, v], idx) => idx > 0 ? [el('div', { classes: ['card__header'] }, el('span', { classes: ['card__subtitle'] }, `Version ${k}`)), v] : v)
            .flat(Infinity);
        if (!description.length) return;

        const disableCheckbox = !autoPopup ? null : el('div', { classes: ['card__field-container'] },
            el('div', { classes: ['card__field'] },
                el('input', {
                    type: 'checkbox',
                    id: 'dgg-tweaks-dont-show-again',
                    name: 'dgg-tweaks-dont-show-again',
                    checked: !settings['show-changelogs'],
                    events: { change: e => changeSetting('show-changelogs', !e.target.checked) }
                })
            ),
            el('label', { classes: ['card__field-label'], for: 'dgg-tweaks-dont-show-again' }, "Don't show this again"),
        );

        const dialog = el('dialog', { classes: ['card', 'card--prominent', 'dgg-tweaks-update-dialog'] },
            el('div', { classes: ['card__header'] },
                el('span', { classes: ['card__title'] }, "DGG Tweaks Changes"),
                el('span', { classes: ['card__subtitle'] }, `Version ${VERSION}`),
            ),
            el('div', { classes: ['card__description'] }, ...description),
            el('div', { classes: ['card__extra', 'card__extra--right'] },
                disableCheckbox,
                el('button', { classes: ['button', 'button--secondary'], events: { click: () => dialog.remove() } }, "Close")
            )
        ).build();
        document.body.appendChild(dialog);
        dialog.showModal();
        dialog.addEventListener('click', function (event) {
            var rect = dialog.getBoundingClientRect();
            var isInDialog = (rect.top <= event.clientY && event.clientY <= rect.top + rect.height &&
                rect.left <= event.clientX && event.clientX <= rect.left + rect.width);
            if (!isInDialog) {
                dialog.remove();
            }
        });
    }
}

async function changelogDialog() {
    // Prior to version 1.5, we have no version saved, but still want to show the changelog. After this point, default to no changelog shown on first entry
    let prevVersion = (await chrome.storage.sync.get('version')).version ?? (compareVersions(VERSION, "1.5") == 0 ? "1.4" : VERSION);
    await chrome.storage.sync.set({ version: VERSION });
    if (settings['show-changelogs']) showChangelogDialog(prevVersion, VERSION, true);
}

// LINK AGGREGATION BUTTON
function openLinkAggregatorPopup() {
    const linksRaw = document.querySelectorAll('.externallink');
    const urls = new Set();
    let messages = [];
    for (const linkEl of linksRaw) {
        if (urls.has(linkEl.href)) continue;

        const message = linkEl.closest('div.msg-user');
        //const username = linkEl.closest('div.msg-user')?.querySelector('a.user')?.textContent;
        if (!message) continue;

        urls.add(linkEl.href);
        ['off', 'Disabled'], ['link', 'Links Only'], ['name', 'Include Usernames'], ['full', 'Full Messages']
        if (settings['aggregate-links-button'] === 'link') {
            messages.push(fromHTML(linkEl.cloneNode(true)));
        } else if (settings['aggregate-links-button'] === 'name') {
            const cloned = message.cloneNode(true);
            cloned.querySelector('.text').replaceWith(linkEl.cloneNode(true));
            messages.push(fromHTML(cloned));
        } else {
            messages.push(fromHTML(message.cloneNode(true)));
        }
    }
    const linkButton = document.getElementById('chat-aggregate-links-btn');
    var popupContent = el('div', { classes: ['dgg-tweaks-aggregate-links'] }, ...messages).build();
    if (messages.length) linkButton._tippy.setContent(popupContent.outerHTML);
    else linkButton._tippy.setContent("<div class='dgg-tweaks-aggregate-links'>No links found in chat</div>");

    if (linkButton._tippy.state.isShown) linkButton._tippy.hide();
    else linkButton._tippy.show();
}

function addLinkAggregationButton() {
    var linkButton = document.getElementById('chat-aggregate-links-btn');
    if (settings["aggregate-links-button"] === 'off') linkButton?.remove();
    else {
        if (!linkButton) {
            const focusButton = document.getElementById('chat-watching-focus-btn');
            linkButton = focusButton.cloneNode(true);
            linkButton.id = 'chat-aggregate-links-btn';
            focusButton.before(linkButton);
            linkButton.addEventListener('click', openLinkAggregatorPopup);
            linkButton.removeAttribute('data-tippy-content');
            tippy(linkButton, {
                trigger: 'click',
                interactive: true,
                allowHTML: true,
                content: "",
                maxWidth: 'none',
            });
        }
    }
}

function showTimeEnabled() {
    return document.getElementById("chat").classList.contains("pref-showtime");
}

const FULL_DATE_FORMAT = {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    suffix: true
};

const TIME_FORMAT = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
}

function formatTimestamp(timestamp, options = FULL_DATE_FORMAT) {
    const { suffix = false, ...formatOptions } = options;
    const date = new Date(timestamp);

    let formatted = new Intl.DateTimeFormat("en-GB", formatOptions).format(date);
    if (suffix) {
        const day = date.getDate();
        formatted = formatted.replace(day.toString(), `${day}${getDaySuffix(day)}`);
    }
    return formatted;
}

function getDaySuffix(day) {
    if (day > 3 && day < 21) return "th";
    switch (day % 10) {
        case 1: return "st";
        case 2: return "nd";
        case 3: return "rd";
        default: return "th";
    }
}

function buildTemplatedChatMessage(username, text, timestamp = Date.now()) {
    const fullDate = formatTimestamp(timestamp, FULL_DATE_FORMAT);
    const time = formatTimestamp(timestamp, TIME_FORMAT);
    const elementString = `<div class="msg-chat msg-user" data-username="${username.toLowerCase()}"><time class="time" title="${fullDate}" data-unixtimestamp="${timestamp}">${time}</time>  <a title="" class="user">${username}</a><span class="ctrl">: </span> <span class="text">${text}</span></div>`;
    const templateContainer = document.createElement('template');
    templateContainer.innerHTML = elementString;
    return templateContainer.content;
}

// INLINE RUSTLESEARCH

let lastRequestTimestamp = null;
let loadingLogs = false;

async function loadRustleLogs() {
    if (loadingLogs) return;
    loadingLogs = true;

    const infoBox = document.querySelector('#chat-user-info');
    const username = infoBox.querySelector('.username').textContent;
    const messageContainer = infoBox.querySelector('.content.os-viewport');

    infoBox.querySelector('.stalk.hidden')?.classList.remove("hidden"); // Unhide message container

    let url = `https://api-v2.rustlesearch.dev/anon/search?channel=Destinygg&username=${encodeURIComponent(username)}`;
    if (lastRequestTimestamp !== null) url += `&search_after=${lastRequestTimestamp}`;
    const res = await fetch(url);
    const json = await res.json();
    const messages = json.data.messages;
    messages.sort((a, b) => a.searchAfter < b.searchAfter);
    
    const existingMessage = messageContainer.lastChild;
    existingMessage?.remove();
    
    const messageEls = await Promise.all(messages.map(async message => {
        const messageContent = await REGEXES.renderChatMessage(message.text);
        return buildTemplatedChatMessage(username, messageContent, message.searchAfter);
    }));

    const relativeScroll = messageContainer.scrollHeight - messageContainer.scrollTop; 

    messageEls.forEach(el => {
        if (messageContainer.firstChild) messageContainer.firstChild.before(el);
        else messageContainer.appendChild(el);
    });

    if (!lastRequestTimestamp) {
        messageContainer.scrollTop = messageContainer.scrollHeight;
        if (existingMessage) {
            const currentEl = messageEls.find(el => el.textContent === existingMessage.textContent);
            if (currentEl) currentEl.scrollIntoView({ block: "nearest", inline: "nearest" });
            else messageContainer.appendChild(existingMessage);
        }
    } else {
        messageContainer.scrollTop = messageContainer.scrollHeight - relativeScroll;
    }

    let moreButton = messageContainer.querySelector(".dgg-tweaks-more-messages-btn");
    if (!moreButton) moreButton = el("button", { classes: ["dgg-tweaks-more-messages-btn"], events: { click: loadRustleLogs } }, "Load more messages").build();
    else moreButton.remove();
    messageContainer.firstChild.before(moreButton);

    lastRequestTimestamp = messages[messages.length - 1].searchAfter;
    loadingLogs = false;
}

async function injectRustleLogs() {
    lastRequestTimestamp = null;
    loadingLogs = false; // In case something went wrong, force not loading
    document.querySelector('#chat-user-info')?.querySelector(".dgg-tweaks-more-messages-btn")?.remove();
    await loadRustleLogs();
}

// RESIZE USER INFO

const RESIZE_AXIS = {
    VERTICAL: 'vertical',
    HORIZONTAL: 'horizontal',
    DIAGONAL: 'diagonal'
}

let currentResizeAxis = RESIZE_AXIS.DIAGONAL;

function startInfoResize(axis) {
    document.addEventListener("mouseup", endResize);
    document.addEventListener("mousemove", resizeInfo);
    currentResizeAxis = axis;
}

function resizeInfo(e) {
    const el = document.querySelector('#chat-user-info');

    const left = parseInt(el.style.left.slice(0, el.style.left.length - 2));
    const top = parseInt(el.style.top.slice(0, el.style.top.length - 2));

    if (currentResizeAxis != RESIZE_AXIS.HORIZONTAL) el.style.height = e.clientY - top + "px";
    if (currentResizeAxis != RESIZE_AXIS.VERTICAL) el.style.width = e.clientX - left + "px";
}

function endResize() {
    document.removeEventListener("mouseup", endResize);
    document.removeEventListener("mousemove", resizeInfo);
}

async function injectInfoResize() {
    const infoBox = document.querySelector('#chat-user-info');
    UTIL.injectStylesheet('css/resize-user-info.css', settings['resize-user-info']);
    if (settings['resize-user-info']) {
        if (!infoBox.querySelector('#info-resize-vertical')) infoBox.appendChild(el('div', { id: 'info-resize-vertical', classes: ['resize-vertical'], events: { mousedown: () => startInfoResize(RESIZE_AXIS.VERTICAL) } }).build());
        if (!infoBox.querySelector('#info-resize-horizontal')) infoBox.appendChild(el('div', { id: 'info-resize-horizontal', classes: ['resize-horizontal'], events: { mousedown: () => startInfoResize(RESIZE_AXIS.HORIZONTAL) } }).build());
        if (!infoBox.querySelector('#info-resize-diagonal')) infoBox.appendChild(el('div', { id: 'info-resize-diagonal', classes: ['resize-diagonal'], events: { mousedown: () => startInfoResize(RESIZE_AXIS.DIAGONAL) } }).build());
    } else {
        infoBox.querySelector('#info-resize-vertical')?.remove();
        infoBox.querySelector('#info-resize-horizontal')?.remove();
        infoBox.querySelector('#info-resize-diagonal')?.remove();
    }
}

// USER INFO BOX

async function injectToUserInfo() {
    if (settings['inline-rustlesearch']) await injectRustleLogs().catch();
    await injectInfoResize();
}

let infoActive = false;
const infoObserver = new MutationObserver((mutations) => {
    mutations.forEach(mu => {
        if (mu.type !== 'attributes' && mu.attributeName !== 'class') return;
        const newInfoActive = mu.target.classList.contains('active');
        if (newInfoActive && !infoActive) injectToUserInfo();
        infoActive = newInfoActive;
    });
});

function registerInfoObserver() {
    if (settings['inline-rustlesearch']) {
        const infoBox = document.getElementById('chat-user-info');
        if (infoBox) infoObserver.observe(infoBox, { attributes: true });
    } else {
        infoObserver.disconnect();
    }
}

// DGG-LAYOUT-FIX
function applyDGGLayoutFix() {
    const moveBefore = (el, newSibling) => newSibling?.parentNode?.insertBefore(el, newSibling);
    const moveAppend = () => (el, newParent) => newParent?.appendChild(el);

    document.querySelector('.navbar .navbar__item[href="/donate"]')?.remove(); // redundant
    document.querySelector('.navbar .navbar__item[href="/"')?.remove(); // redundant

    // TODO tinker with responsive collapsing
    const moneyButtons = document.createElement("div");
    moneyButtons.className = "navbar__items _layoutfix_navbar__money";

    moveAppend(
        document.getElementById("donate-btn"),
        // document.querySelector(".navbar__items.navbar__navigation")
        moneyButtons
    );
    moveAppend(
        document.getElementById("subscribe-btn"),
        // document.querySelector(".navbar__items.navbar__navigation")
        moneyButtons
    );
    moveBefore(
        document.getElementById("control-title"),
        document.querySelector(".control-badges")
    );
    moveBefore(
        document.getElementById("stream-controls"),
        document.getElementById("embed")
    );
    moveBefore(
        document.getElementById("control-buttons"),
        // document.querySelector('.navbar__actions')
        document.querySelector(".navbar__actions>:first-child")
    );
    moveBefore(
        moneyButtons,
        document.querySelector(".navbar__actions>:first-child")
    );
}

// MENTION BUTTON
async function openMentionsPopup() {
    const mentionsButton = document.getElementById('dgg-tweaks-mentions-btn');

    if (mentionsButton._tippy.state.isShown) return;
    
    mentionsButton._tippy.setContent(`<div class='dgg-tweaks-mentions-popup' style='padding: 8px 12px;'>Loading...</div>`);
    mentionsButton._tippy.show();

    const username = document.getElementById("chat-input-control").placeholder.split(' ')[2];

    let messages = [];

    const res = await fetch(`https://www.destiny.gg/api/chat/mentions?username=${encodeURIComponent(username)}&limit=10`);
    const json = await res.json();
    const msgArr = Array.isArray(json) ? json : Object.values(json).filter(item => typeof item !== "string" && item);
    msgArr.sort((a, b) => a.date - b.date);

    async function processMessage(message) {
        const messageContent = await REGEXES.renderChatMessage(message.text);
        messages.push(fromHTML(buildTemplatedChatMessage(message.nick, messageContent, message.date * 1000)));
    }
    var promises = []
    for (const message of msgArr) {
        promises.push(processMessage(message));
    }
    await Promise.allSettled(promises);
    
    if (messages.length) {
        var popupContent = el('div', { classes: ['dgg-tweaks-mentions-popup', settings['mentions-force-timestamps'] && 'pref-showtime'] }, ...messages).build();
        mentionsButton._tippy.setContent(popupContent.outerHTML);
    }
    else mentionsButton._tippy.setContent("<div class='dgg-tweaks-mentions-popup'>No mentions found</div>");
}

function addMentionsButton() {
    var mentionsButton = document.getElementById('dgg-tweaks-mentions-btn');
    if (!settings["mentions-button"]) mentionsButton?.remove();
    else if (!mentionsButton) {
        const whisperButton = document.getElementById('chat-whisper-btn');
        mentionsButton = whisperButton.cloneNode(true);
        mentionsButton.id = 'dgg-tweaks-mentions-btn';
        whisperButton.after(mentionsButton);
        mentionsButton.addEventListener('click', openMentionsPopup);
        mentionsButton.removeAttribute('data-tippy-content');
        tippy(mentionsButton, {
            trigger: 'click',
            interactive: true,
            allowHTML: true,
            content: "",
            maxWidth: 'none',
        });
    }
}

// MAIN

async function onLoad() {
    if (PAGE_TYPE === PAGE_TYPES.CHAT) {
        chatSettingsMenu();
        UTIL.injectStylesheet('css/link-size.css');
        registerInfoObserver();
        if (settings['inline-rustlesearch']) REGEXES.renderChatMessage("");
    } else {
        globalNavbarSettingsButton();
        changelogDialog();
    }
    if (PAGE_TYPE === PAGE_TYPES.BIGSCREEN) {
        UTIL.injectStylesheet('css/bigscreen-menubar.css', settings['bigscreen-menubar']);
        UTIL.injectStylesheet('css/bigscreen-controls.css', settings['bigscreen-controls']);
        UTIL.injectStylesheet('css/dgg-layout-fix.css', settings['dgg-layout-fix']);
        if (settings['dgg-layout-fix']) applyDGGLayoutFix();
    }
    if (PAGE_TYPE === PAGE_TYPES.SETTINGS) {
        profileSettingsNavbar();
        if (window.location.search === '?dgg-tweaks') profileSettingsMenu();
    }
}

async function onSettingsChanged() {
    if (PAGE_TYPE === PAGE_TYPES.CHAT) {
        UTIL.injectStylesheet('css/link-size-debug.css', settings['link-size-debug']);
        document.body.style.setProperty('--link-size', isNaN(Number(settings['link-size'])) ? 0 : settings['link-size'] - 1);
        addLinkAggregationButton();
        addMentionsButton();
        const userInfo = document.querySelector('#chat-user-info');
        userInfo.classList.remove('pref-showtime');
        if (settings['inline-rustlesearch'] && settings['inline-force-timestamps']) userInfo.classList.add('pref-showtime');
    }
}

async function main() {
    UTIL.injectStylesheet('css/base.css');
    await loadSettings();
    await onLoad();
    await onSettingsChanged();
}

if (document.readyState !== "loading") main();
else document.addEventListener("DOMContentLoaded", main);