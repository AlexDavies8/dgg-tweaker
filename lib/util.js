var UTIL = (() => {

    function waitForCSS(href) {
        function check(observer, resolve) {
            const linkElement = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).find(link => link.href.includes(href));

            if (linkElement) {
                if (linkElement.sheet) {
                    observer.disconnect();
                    resolve(linkElement);
                } else {
                    linkElement.addEventListener('load', () => {
                        observer.disconnect();
                        resolve(linkElement);
                    });
                }
            }
        }
        return new Promise(resolve => {
            const observer = new MutationObserver(() => check(observer, resolve));

            observer.observe(document.head || document.documentElement, { childList: true, subtree: true });

            check(observer, resolve);
        });
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

    return { waitForCSS, injectStylesheet };
})();

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
            if (child === null || child === undefined || child === false) continue;
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