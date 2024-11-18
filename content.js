// Basic Declarative Markup to make HTML in JS
class HTMLNode {
    constructor(type, args = {}, ...children) {
        if (type === undefined) {
            this._args = {};
            this._children = [];
        } else {
            this._type = type;
            this._args = args;
            this._children = children.flat(Infinity);
        }
    }

    static fromElement(element) {
        const node = new HTMLNode();
        node._rawEl = element;
        return node;
    }

    build() {
        const el = this._rawEl ?? document.createElement(this._type);
        for (const key in this._args) {
            if (key === 'classes') el.classList.add(...this._args[key]);
            else if (key === 'events') {
                for (const type in this._args[key]) {
                    el.addEventListener(type, this._args[key][type]);
                }
            }
            else el[key] = this._args[key];
        }
        for (const child of this._children) {
            if (typeof child === 'string') el.appendChild(document.createTextNode(child));
            else el.appendChild(child.build());
        }
        return el;
    }

    children(...children) {
        this._children.push(children.flat(Infinity));
        return this;
    }

    attrs(attrs) {
        Object.assign(this.args, attrs);
        return this;
    }
}
function el(type, args, ...children) {
    const node = new HTMLNode(type, args, ...children);
    return node;
}
function fromHTML(htmlElement) {
    return HTMLNode.fromElement(htmlElement);
}
function fromHTMLString(htmlString) {
    const container = document.createElement('div');
    container.innerHTML = htmlString;
    let nodes = [];
    for (const element of container.childNodes) {
        nodes.push(HTMLNode.fromElement(element));
    }
    container.remove();
    return nodes;
}

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
    'aggregate-links-button': true,
    'inline-rustlesearch': true
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
    [INPUT_TYPES.CHECKBOX]: (key, label, description) => el('div', { classes: ['form-group', 'checkbox'] },
        el('label', { title: description },
            el('input', {
                name: 'dgg-tweaker-' + key,
                type: 'checkbox',
                checked: settings[key],
                events: { change: e => changeSetting(key, e.target.checked) }
            }),
            label
        )
    ),
    [INPUT_TYPES.NUMBER_FIELD]: (key, label, description, placeholder, min = undefined, max = undefined) => el('div', { classes: ['form-group'] },
        el('label', { title: description, for: 'dgg-tweaker-' + key }, label),
        el('input', {
            classes: ['form-control'],
            type: 'number',
            id: 'dgg-tweaker-' + key,
            name: 'dgg-tweaker-' + key,
            value: settings[key],
            min,
            max,
            placeholder,
            events: {
                change: e => changeSetting(key, parseFloat(e.target.value))
            }
        })
    ),
    [INPUT_TYPES.SELECT]: (key, label, description, options) => el('div', { classes: ['form-group'] },
        el('label', { title: description, for: 'dgg-tweaker-' + key }, label),
        el('select', {
            classes: ['form-control'],
            id: 'dgg-tweaker-' + key,
            name: 'dgg-tweaker-' + key,
            events: {
                change: e => changeSetting(key, e.target.value)
            }
        }, ...options.map(option => el('option', { value: option[0], selected: option[0] === settings[key] ? true : undefined }, option[1])))
    )
}

const PROFILE_UI = {
    [INPUT_TYPES.CHECKBOX]: (key, label, description) => el('div', { classes: ['user-info__section'] }, 
        el('label', { classes: ['user-info__label'], for: 'dgg-tweaker-' + key }, label),
        el('div', {classes: ['user-info__hint']}, description),
        el('div', {classes: ['user-info__field']},
            el('input', {
                type: 'checkbox',
                id: 'dgg-tweaker-' + key,
                name: 'dgg-tweaker-' + key,
                checked: settings[key],
                events: { change: e => changeSetting(key, e.target.checked) }
            })
        )
    ),
    [INPUT_TYPES.NUMBER_FIELD]: (key, label, description, placeholder, min = undefined, max = undefined) => el('div', { classes: ['user-info__section'] }, 
        el('label', { classes: ['user-info__label'], for: 'dgg-tweaker-' + key }, label),
        el('div', {classes: ['user-info__hint']}, description),
        el('div', {classes: ['user-info__field']},
            el('div', {classes:['input']},
                el('div', {classes:['input__area']},
                    el('div', {classes:['input__container']},
                        el('input', {
                            type: 'number',
                            id: 'dgg-tweaker-' + key,
                            name: 'dgg-tweaker-' + key,
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
    [INPUT_TYPES.BUTTON]: (key, label, description, buttonText, click) => el('div', { classes: ['user-info__section'] }, 
        el('label', { classes: ['user-info__label'], for: 'dgg-tweaker-' + key }, label),
        el('div', {classes: ['user-info__hint']}, description),
        el('div', {classes: ['user-info__field']},
            el('input', {
                type: 'button',
                id: 'dgg-tweaker-' + key,
                name: 'dgg-tweaker-' + key,
                classes: ['button', 'button--secondary'],
                events: { click },
                value: buttonText
            })
        )
    ),
    [INPUT_TYPES.SELECT]: (key, label, description, options) => el('div', { classes: ['user-info__section'] }, 
        el('label', { classes: ['user-info__label'], for: 'dgg-tweaker-' + key }, label),
        el('div', {classes: ['user-info__hint']}, description),
        el('div', {classes: ['user-info__field']},
            el('div', {classes:['input']},
                el('div', {classes:['input__area']},
                    el('div', {classes:['input__container']},
                        el('select', {
                            classes: ['form-control'],
                            id: 'dgg-tweaker-' + key,
                            name: 'dgg-tweaker-' + key,
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
        el('h4', { }, "DGG Tweaks"),
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

async function showChangelogDialog(fromVersion, toVersion) {
    if (fromVersion !== toVersion) {
        const changelogs = await loadChangelogFile();
        const description = Object.entries(changelogs)
            .filter(entry => compareVersions(String(entry[0]), fromVersion) > -1)
            .filter(entry => compareVersions(String(entry[0]), toVersion) < 1)
            .reverse()
            .map(entry => [entry[0], el('p', {}, fromHTMLString(entry[1]))])
            .map(([k, v], idx) => idx > 0 ? [el('div', {classes:['card__header']}, el('span', {classes:['card__subtitle']}, `Version ${k}`)), v] : v)
            .flat(Infinity);
        if (!description.length) return;

        const dialog = el('dialog', { classes: ['card', 'card--prominent', 'dgg-tweaks-update-dialog'] },
            el('div', {classes:['card__header']},
                el('span', {classes:['card__title']}, "DGG Tweaks Changes"),
                el('span', {classes:['card__subtitle']}, `Version ${VERSION}`), 
            ),
            el('div', {classes:['card__description']}, ...description),
            el('div', {classes:['card__extra','card__extra--right']},
                el('button', {classes:['button','button--secondary'], events: {click: () => dialog.remove()}}, "Close")
            )
        ).build();
        document.body.appendChild(dialog);
        dialog.showModal();
        dialog.addEventListener('click', function(event) {
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
    if (settings['show-changelogs']) showChangelogDialog(prevVersion, VERSION);
}

// STYLESHEETS

function injectStylesheet(url, enabled = true) {
    const href = chrome.runtime.getURL(url);
    const existingLink = document.querySelector(`link[href='${href}']`);
    if (existingLink !== null) {
        if (enabled) return;
        else existingLink.remove();
    }
    if (!enabled) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = href;
    document.head.appendChild(link);
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

// INLINE RUSTLESEARCH
let emoteRegex;
let emotes;
function getEmotes() {
    if (!emotes) {
        emoteEls = Array.from(document.querySelectorAll('.emote-item')).map(emoteItem => emoteItem.firstChild);
        emotes = {};
        for (const emoteEl of emoteEls) {
            emotes[emoteEl.textContent] = emoteEl.className;
        }
    }
    return emotes;
}
function getEmoteRegex() {
    if (!emoteRegex) {
        const emotes = getEmotes();
        emoteRegex = new RegExp(`(^|\\s)(${Object.keys(emotes).join('|')})(?=$|\\s)`, 'gm');
    }
    return emoteRegex;
}

// Stolen directly from hashlinkconverter.js in dgg chat-gui
class HashLinkConverter {
    constructor() {
        this.hasHttp = /^http[s]?:\/{0,2}/;
        this.youtubeRegex = /^(?:shorts|live|embed)\/([A-Za-z0-9-_]{11})$/;
        this.twitchClipRegex = /^[^/]+\/clip\/([A-Za-z0-9-_]*)$/;
        this.twitchVODRegex = /^videos\/(\d+)$/;
        this.rumbleEmbedRegex = /^embed\/([a-z0-9]+)\/?$/;
    }

    convert(urlString) {
        if (!urlString) {
            throw new Error(MISSING_ARG_ERROR);
        }
        const url = new URL(
            // if a url doesn't have a protocol, URL throws an error
            urlString.match(this.hasHttp) ? urlString : `https://${urlString}`,
        );
        const pathname = url.pathname.slice(1);
        let match;
        let videoId;
        let timestamp;
        switch (url.hostname) {
            case 'www.twitch.tv':
            case 'twitch.tv':
                match = pathname.match(this.twitchClipRegex);
                if (match) {
                    return `#twitch-clip/${match[1]}`;
                }
                match = pathname.match(this.twitchVODRegex);
                if (match) {
                    return `#twitch-vod/${match[1]}`;
                }
                return `#twitch/${pathname}`;
            case 'clips.twitch.tv':
                return `#twitch-clip/${pathname}`;
            case 'www.youtube.com':
            case 'youtube.com':
                match = pathname.match(this.youtubeRegex);
                timestamp = url.searchParams.get('t');
                videoId = url.searchParams.get('v') ?? match?.[1];
                if (!videoId) {
                    throw new Error(MISSING_VIDEO_ID_ERROR);
                }
                return timestamp
                    ? `#youtube/${videoId}?t=${timestamp}`
                    : `#youtube/${videoId}`;
            case 'www.youtu.be':
            case 'youtu.be':
                timestamp = url.searchParams.get('t');
                return timestamp
                    ? `#youtube/${pathname}?t=${timestamp}`
                    : `#youtube/${pathname}`;
            case 'www.rumble.com':
            case 'rumble.com':
                match = pathname.match(this.rumbleEmbedRegex);
                if (match) {
                    return `#rumble/${match[1]}`;
                }
                throw new Error(RUMBLE_EMBED_ERROR);
            case 'www.kick.com':
            case 'kick.com':
                if (url.searchParams.has('clip') || pathname.startsWith('video/')) {
                    throw new Error(INVALID_LINK_ERROR);
                }
                return `#kick/${pathname}`;
            default:
                throw new Error(INVALID_LINK_ERROR);
        }
    }
}
const hashlinkConverter = new HashLinkConverter();

function encodeLinkUrl(value) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, (v) => {
        const hi = v.charCodeAt(0);
        const low = v.charCodeAt(1);
        return `&#${(hi - 0xd800) * 0x400 + (low - 0xdc00) + 0x10000};`;
        })
        .replace(/([^#-~| |!])/g, (v) => `&#${v.charCodeAt(0)};`)
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
function renderUrlEmbed(str) {
    let extraclass = '';

    if (/\b(?:NSFL)\b/i.test(str)) extraclass = 'nsfl-link';
    else if (/\b(?:NSFW)\b/i.test(str)) extraclass = 'nsfw-link';
    else if (/\b(?:SPOILERS)\b/i.test(str)) extraclass = 'spoilers-link';

    return str.replace(LINKREGEX, (url, scheme) => {
      const decodedUrl = url;
      const m = decodedUrl.match(LINKREGEX);
      if (m) {
        const normalizedUrl = encodeLinkUrl(normalizeUrl(m[0]));

        let embedHashLink = '';
        try {
          embedHashLink = hashlinkConverter.convert(decodedUrl);
        } catch {}

        const maxUrlLength = 90;
        let urlText = normalizedUrl;
        if (
          !(document.querySelector('input[name="showentireurl"]')?.checked ?? false) &&
          urlText.length > maxUrlLength
        ) {
          urlText = `${urlText.slice(0, 40)}...${urlText.slice(-40)}`;
        }

        const extra = encodeLinkUrl(decodedUrl.substring(m[0].length));
        const href = `${scheme ? '' : 'http://'}${normalizedUrl}`;

        const embedTarget = window.top !== this ? '_top' : '_blank';
        const embedUrl = window.location.origin + '/bigscreen' + embedHashLink;
        return embedHashLink
          ? `<a target="_blank" class="externallink ${extraclass}" href="${href}" rel="nofollow">${urlText}</a><a target="${embedTarget}" class="embed-button" href="${embedUrl}"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="14.4" viewBox="0 0 640 512"><path d="M64 64V352H576V64H64zM0 64C0 28.7 28.7 0 64 0H576c35.3 0 64 28.7 64 64V352c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zM128 448H512c17.7 0 32 14.3 32 32s-14.3 32-32 32H128c-17.7 0-32-14.3-32-32s14.3-32 32-32z"  fill="#fff"/></svg></a>`
          : `<a target="_blank" class="externallink ${extraclass}" href="${href}" rel="nofollow">${urlText}</a>${extra}`;
      }
      return url;
    });
  }
function normalizeUrl(url) {
    if (/(x|twitter)\.com\/\w{1,15}\/status\/\d{2,19}\?/i.test(url)) return url.split('?')[0];
    if (/^(?:(?:https|http):\/\/)?(?:www\.)?youtu(?:be\.com|\.be)/i.test(url)) {
        try {
            const ytLink = new URL(url);
            ytLink.searchParams.delete('si');
            return ytLink.href;
        } catch {
            return url;
        }
    }
    return url;
}

const embedRegex = /(^|\s)(#(kick|twitch|twitch-vod|twitch-clip|youtube|youtube-live|facebook|rumble|vimeo)\/([\w\d]{3,64}\/videos\/\d{10,20}|[\w-]{3,64}|\w{7}\/\?pub=\w{5})(?:\?t=(\d+)s?)?)\b/g;
function renderChatMessage(str) {
    let htmlString = str;

    if (htmlString.startsWith('/me ')) htmlString = htmlString.slice(4);

    // Greentext
    if (str.indexOf('>') === 0) htmlString = `<span class="greentext">${htmlString}</span>`;

    // Emotes
    const regex = getEmoteRegex();
    htmlString = htmlString.replace(regex, '$1<div title="$2" class="emote $2">$2 </div>');

    // Slash embeds
    let extraclass = '';
    if (/\b(?:NSFL)\b/i.test(str)) extraclass = 'nsfl-link';
    else if (/\b(?:NSFW)\b/i.test(str)) extraclass = 'nsfw-link';
    else if (/\b(?:SPOILERS)\b/i.test(str)) extraclass = 'spoilers-link';

    const target = window.top !== this ? '_top' : '_blank';
    const baseUrl = window.location.origin + '/bigscreen';
    htmlString = htmlString.replace(embedRegex, `$1<a class="externallink bookmarklink ${extraclass}" href="${baseUrl}$2" target="${target}">$2</a>`);

    // Links
    htmlString = renderUrlEmbed(htmlString);

    return htmlString;
}

async function injectRustleLogs() {
    const infoBox = document.querySelector('#chat-user-info');
    const username = infoBox.querySelector('.username').textContent;
    const res = await fetch(`https://api-v2.rustlesearch.dev/anon/search?channel=Destinygg&username=${encodeURIComponent(username)}`);
    const json = await res.json();
    const messages = json.data.messages;
    const messageContainer = infoBox.querySelector('.content.os-viewport');
    const messageTemplate = messageContainer.firstChild;
    const templateText = messageTemplate.textContent;
    let currentEl;
    for (const message of messages) {
        const innerHTML = renderChatMessage(message.text);
        const messageEl = messageTemplate.cloneNode(true);
        messageEl.querySelector('.text').innerHTML = innerHTML;
        messageTemplate.after(messageEl);
        if (!currentEl && messageEl.textContent === templateText) currentEl = messageEl;
    }
    if (!currentEl) messageContainer.scrollTop = messageContainer.scrollHeight;
    else {
        messageTemplate.remove();
        currentEl.scrollIntoView({block: "nearest", inline: "nearest"});
    }
}
function waitForCSS(href) {
    return new Promise(resolve => {
        const observer = new MutationObserver(() => {
            const linkElement = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).find(link => link.href.includes(href));

            if (linkElement) {
                if (linkElement.sheet) {
                    observer.disconnect();
                    resolve();
                } else {
                    linkElement.addEventListener('load', () => {
                        observer.disconnect();
                        resolve();
                    });
                }
            }
        });

        observer.observe(document.head || document.documentElement, { childList: true, subtree: true });
    });
}
async function loadEmotes() {
    await waitForCSS("emotes.css");
    const emoteButton = document.getElementById('chat-emoticon-btn');
    emoteButton.click(); // Open
    emoteButton.click(); // Close
}

// USER INFO BOX

function injectToUserInfo() {
    if (settings['inline-rustlesearch']) injectRustleLogs();
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

// MAIN

async function onLoad() {
    if (PAGE_TYPE === PAGE_TYPES.CHAT) {
        chatSettingsMenu();
        injectStylesheet('css/link-size.css');
        registerInfoObserver();
        if (settings['inline-rustlesearch']) loadEmotes();
    } else {
        globalNavbarSettingsButton();
        changelogDialog();
    }
    if (PAGE_TYPE === PAGE_TYPES.BIGSCREEN) {
        injectStylesheet('css/bigscreen-menubar.css', settings['bigscreen-menubar']);
        injectStylesheet('css/bigscreen-controls.css', settings['bigscreen-controls']);
    }
    if (PAGE_TYPE === PAGE_TYPES.SETTINGS) {
        profileSettingsNavbar();
        if (window.location.search === '?dgg-tweaks') profileSettingsMenu();
    }
}

async function onSettingsChanged() {
    if (PAGE_TYPE === PAGE_TYPES.CHAT) {
        injectStylesheet('css/link-size-debug.css', settings['link-size-debug']);
        document.body.style.setProperty('--link-size', settings['link-size'] - 1);
        addLinkAggregationButton();
    }
}

async function main() {
    injectStylesheet('css/base.css');
    await loadSettings();
    await onLoad();
    await onSettingsChanged();
}

main();