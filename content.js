const link = document.createElement('link');
link.rel = 'stylesheet';
link.type = 'text/css';
link.href = chrome.runtime.getURL('style.css');
document.head.appendChild(link);

const inject_logs_link = () => {
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

const chat_info_box = document.getElementById('chat-user-info');
if (chat_info_box) attrObserver.observe(document.getElementById('chat-user-info'), { attributes: true });

