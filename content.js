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
function fromHTML(htmlString) {
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
    BUTTON: Symbol('button')
}
const settingsMenuDef = [
    {
        heading: "Chat",
        subheading: "Settings that affect DGG Chat (including embeds)",
        fields: [
            [INPUT_TYPES.CHECKBOX, 'better-icons', "Better Icons", "Enable more visually consistent chat icons from FontAwesome"],
            [INPUT_TYPES.CHECKBOX, 'full-logs-button', "Enable \'View Logs\' Button", "Adds a button to the right click menu to search logs on rustlesearch.dev"],
            [INPUT_TYPES.NUMBER_FIELD, 'link-size', "Link Size", 'Increase the clickable area for links (no visual change)', "1.00", 1.00],
            [INPUT_TYPES.CHECKBOX, 'link-size-debug', "Visualise Link Size", "Show an outline around the clickable area (debug option)"],
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
    'better-icons': true,
    'full-logs-button': true,
    'bigscreen-menubar': true,
    'bigscreen-controls': false,
    'link-size': 1.00,
    'link-size-debug': false
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
                change: e => updateSetting(key, parseFloat(e.target.value))
            }
        })
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
                events: { change: e => updateSetting(key, e.target.checked) }
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
                                change: e => updateSetting(key, parseFloat(e.target.value))
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
    )
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
            fromHTML(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-wrench"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`),
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
            .map(entry => [entry[0], el('p', {}, fromHTML(entry[1]))])
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

// USER INFO MENU

function injectLogsButton() {
    var button = document.getElementById('full-logs-user-btn');
    if (!button) {
        var to_copy = document.getElementById('logs-user-btn');
        button = to_copy.cloneNode(true);
        to_copy.parentElement.appendChild(button);
        button.id = 'full-logs-user-btn';
        button.title = 'See Logs';
        button.target = '_blank';
    }
    var username = document.querySelector('#chat-user-info .username').textContent;
    button.href = `https://rustlesearch.dev/?username=${encodeURIComponent(username)}&channel=Destinygg`;
}

let info_active = false;
const attrObserver = new MutationObserver((mutations) => {
    mutations.forEach(mu => {
        if (mu.type !== 'attributes' && mu.attributeName !== 'class') return;
        const new_info_active = mu.target.classList.contains('active');
        if (new_info_active && !info_active) injectLogsButton();
        info_active = new_info_active;
    });
});

function registerFullLogsButton() {
    if (settings['full-logs-button']) {
        const chat_info_box = document.getElementById('chat-user-info');
        if (chat_info_box) attrObserver.observe(document.getElementById('chat-user-info'), { attributes: true });
    } else {
        attrObserver.disconnect();
        document.getElementById('full-logs-user-btn')?.remove();
    }
}

// MAIN

async function onLoad() {
    if (PAGE_TYPE === PAGE_TYPES.CHAT) {
        chatSettingsMenu();
        injectStylesheet('css/link-size.css');
    } else {
        globalNavbarSettingsButton();
    }
    if (PAGE_TYPE === PAGE_TYPES.BIGSCREEN) {
        injectStylesheet('css/bigscreen-menubar.css', settings['bigscreen-menubar']);
        injectStylesheet('css/bigscreen-controls.css', settings['bigscreen-controls']);
    }
    if (PAGE_TYPE === PAGE_TYPES.SETTINGS) {
        profileSettingsNavbar();
        if (window.location.search === '?dgg-tweaks') profileSettingsMenu();
    }
    if (PAGE_TYPE === PAGE_TYPES.DEFAULT) {
        changelogDialog();
    }
}

async function onSettingsChanged() {
    if (PAGE_TYPE === PAGE_TYPES.CHAT) {
        injectStylesheet('css/better-icons.css', settings['better-icons']);
        injectStylesheet('css/link-size-debug.css', settings['link-size-debug']);
        document.body.style.setProperty('--link-size', settings['link-size'] - 1);
        registerFullLogsButton();
    }
}

async function main() {
    injectStylesheet('css/base.css');
    await loadSettings();
    await onLoad();
    await onSettingsChanged();
}

main();