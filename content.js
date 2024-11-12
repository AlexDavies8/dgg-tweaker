let settings = {
    'better-icons': true,
    'full-logs-button': true,
    'bigscreen-menubar': true,
    'link-size': 1.00,
    'link-size-debug': false
};

const PAGE_TYPES = {
    BIGSCREEN: 'bigscreen',
    CHAT: 'chat',
    SETTINGS: 'settings',
    DEFAULT: 'default'
};

const PAGE_TYPE = getPageType();

function updateSetting(key, value) {
    settings[key] = value;
    chrome.storage.sync.set({ settings });
    refresh();
}

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

function inject_logs_link() {
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
        if (new_info_active && !info_active) inject_logs_link();
        info_active = new_info_active;
    });
});

function injectFullLogs() {
    if (settings['full-logs-button']) {
        const chat_info_box = document.getElementById('chat-user-info');
        if (chat_info_box) attrObserver.observe(document.getElementById('chat-user-info'), { attributes: true });
    } else {
        attrObserver.disconnect();
        document.getElementById('full-logs-user-btn')?.remove();
    }
}

class HTMLNode {
    constructor(type, args = {}, ...children) {
        if (type === undefined) return;
        this._type = type;
        this._args = args;
        this._children = children.flat(Infinity);
    }

    static fromElement(element) {
        const node = new HTMLNode();
        node._rawEl = element;
        return node;
    }

    build() {
        if (this._rawEl !== undefined) return this._rawEl;

        const el = document.createElement(this._type);
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

function getPageType() {
    var path = window.location.pathname;

    if (path === '/bigscreen') return PAGE_TYPES.BIGSCREEN;
    if (path === '/embed/chat') return PAGE_TYPES.CHAT;
    if (path.startsWith('/profile')) return PAGE_TYPES.SETTINGS;

    return PAGE_TYPES.DEFAULT;
}
    
const ChatUI = {
    Settings: {
        checkbox(key, label, tooltip) {
            return el('div', { classes: ['form-group', 'checkbox'] },
                el('label', { title: tooltip },
                    el('input', {
                        name: 'dgg-tweaker-' + key,
                        type: 'checkbox',
                        checked: settings[key],
                        events: { change: e => updateSetting(key, e.target.checked) }
                    }),
                    label
                )
            );
        },
        numberInput(key, label, tooltip, placeholder, min = undefined, max = undefined) {
            const id = 'dgg-tweaker-' + key;
            return el('div', { classes: ['form-group'] },
                el('label', { title: tooltip, for: id }, label),
                el('input', {
                    classes: ['form-control'],
                    type: 'number',
                    id,
                    name: key,
                    value: settings[key],
                    min,
                    max,
                    placeholder,
                    events: {
                        change: e => updateSetting(key, parseFloat(e.target.value))
                    }
                })
            );
        },
        heading(text) {
            return el('h4', {}, text);
        }
    }
}

function injectChatSettingsMenu() {
    const menu = el('div', { id: 'dgg-tweaks-settings' },
        ChatUI.Settings.heading('DGG Tweaker'),
        ChatUI.Settings.checkbox('better-icons', 'Better Icons', 'Enable more visually consistent chat icons from FontAwesome'),
        ChatUI.Settings.checkbox('full-logs-button', 'Enable \'View Logs\' Button', 'Adds a button to the right click menu to search logs on rustlesearch.dev'),
        ChatUI.Settings.numberInput('link-size', 'Link Size', 'Increase the clickable area for links (no visual change)', '1.00', 1.00),
        ChatUI.Settings.checkbox('link-size-debug', 'Visualise Link Size', 'Show an outline around the clickable area (debug option)'),
    ).build();

    document.getElementById('chat-settings-form').appendChild(menu);
}

function injectNavbarSettingsButton() {
    const item = el('li', { classList: ['dropdown__item'] }, 
        el('a', { classList: ['dropdown__link'], href: '/profile/?dgg-tweaker' },
            fromHTML(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-wrench"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`),
            " DGG Tweaker"
        )
    ).build();
    document
        .querySelector('.navbar__actions')
        .querySelector('ul.dropdown')
        .querySelector('hr')
        .before(item);
}

const ProfileUI = {
    navItem(active) {
        return el('li', { classes: active ? ['tab', 'tab--active'] : ['tab'] },
            el('a', { classes: ['tab__link'], href: '/profile/?dgg-tweaker' },
                'DGG Tweaker'
            )
        );
    },
    Content: {
        heading(title, subtitle) {
            components = [];
            components.push(el('h2', { classes: ['profile-heading__title'] }, title));
            if (subtitle !== undefined) components.push(el('span', { classes: ['profile-heading__subtitle'] }, subtitle));
            return el('div', { classes: ['profile-heading'] }, components);
        },
        textInput(key, label, hint, placeholder) {
            const id = 'dgg-tweaker-' + key;
            return el('div', { classes: ['user-info__section'] }, 
                el('label', { classes: ['user-info__label'], for: id }, label),
                el('div', {classes: ['user-info__hint']}, hint),
                el('div', {classes: ['user-info__field']},
                    el('div', {classes:['input']},
                        el('div', {classes:['input__area']},
                            el('div', {classes:['input__container']},
                                el('input', {
                                    id,
                                    name: key,
                                    value: settings[key],
                                    placeholder: placeholder,
                                    events: {
                                        change: e => updateSetting(key, e.target.value)
                                    }
                                })
                            )
                        )
                    )
                )
            );
        },
        numberInput(key, label, hint, placeholder, min = undefined, max = undefined) {
            const id = 'dgg-tweaker-' + key;
            return el('div', { classes: ['user-info__section'] }, 
                el('label', { classes: ['user-info__label'], for: id }, label),
                el('div', {classes: ['user-info__hint']}, hint),
                el('div', {classes: ['user-info__field']},
                    el('div', {classes:['input']},
                        el('div', {classes:['input__area']},
                            el('div', {classes:['input__container']},
                                el('input', {
                                    type: 'number',
                                    id,
                                    name: key,
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
            );
        },
        checkbox(key, label, hint) {
            const id = 'dgg-tweaker-' + key;
            return el('div', { classes: ['user-info__section'] }, 
                el('label', { classes: ['user-info__label'], for: id }, label),
                el('div', {classes: ['user-info__hint']}, hint),
                el('div', {classes: ['user-info__field']},
                    el('input', {type: 'checkbox', id, name: id, checked: settings[key] })
                )
            );
        }
    }
}

function injectProfilePage() {
    const active = window.location.search === '?dgg-tweaker';
    document
        .querySelector('.tabs.tabs--vertical')
        .appendChild(ProfileUI.navItem(active).build());
    if (active) {
        document.querySelector('.tab.tab--active').classList.remove('tab--active');

        const content = el('div', { classes: ['profile-content'] },
            el('section', {},
                ProfileUI.Content.heading('Chat', 'Settings that affect DGG Chat (including embeds)'),
                ProfileUI.Content.checkbox('better-icons', 'Better Icons', 'Enable more visually consistent chat icons from FontAwesome'),
                ProfileUI.Content.checkbox('full-logs-button', 'Enable \'View Logs\' Button', 'Adds a button to the right click menu to search logs on rustlesearch.dev'),
                ProfileUI.Content.numberInput('link-size', 'Link Size', 'Increase the clickable area for links (no visual change)', "1.00", 1.00),
                ProfileUI.Content.checkbox('link-size-debug', 'Visualise Link Size', 'Show an outline around the clickable area (debug option)'),
            ),
            el('section', {},
                ProfileUI.Content.heading('Big Screen', 'Settings that affect the Big Screen'),
                ProfileUI.Content.checkbox('bigscreen-menubar', 'Cinema Mode Menu Bar', 'Slide out the menu bar on hover while in Cinema Mode')
            )
        ).build();

        document
            .querySelector('.profile-content')
            .replaceWith(content);
    }
}

function load() {
    if (PAGE_TYPE === PAGE_TYPES.CHAT) {
        injectStylesheet('css/link-size.css');
        injectChatSettingsMenu();
    } else {
        injectNavbarSettingsButton();
    }
    if (PAGE_TYPE === PAGE_TYPES.BIGSCREEN) {
        injectStylesheet('css/bigscreen-menubar.css', settings['bigscreen-menubar']);
    }
    if (PAGE_TYPE === PAGE_TYPES.SETTINGS) {
        injectProfilePage();
    }
    refresh();
}
function refresh() {
    if (PAGE_TYPE === PAGE_TYPES.CHAT) {
        injectStylesheet('css/better-icons.css', settings['better-icons']);
        injectStylesheet('css/link-size-debug.css', settings['link-size-debug']);
        document.body.style.setProperty('--link-size', (settings['link-size'] - 1) + 'em');
        injectFullLogs();
    }
}

async function loadSettings() {
    settings = Object.assign(settings, (await chrome.storage.sync.get('settings')).settings);
    load();
    refresh();
}

injectStylesheet('css/base.css');
loadSettings();