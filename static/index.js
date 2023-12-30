const url_input = document.querySelector('input')
const message_holder = document.getElementById('message')
const process_button = document.querySelector('button')
async function display_message(content, color, duration = -1) {
    if (content.length > 255 || color.length > 255) {
        console.error("[Display message] Supplied parameters are too long.")
        return
    }

    message_holder.textContent = content;
    message_holder.style.color = color;

    if (duration !== -1) {
        await new Promise(r => setTimeout(r, duration * 1000))
        message_holder.style.color = ''
        message_holder.textContent = ''
    }
}

function verify_url(url) {
    if (url.trim() === "") {
        display_message("You can't shorten an empty URL.", 'red', 5)
        return false
    }

    if (!url.match(/^(?:\w+:\/\/)?(?:www\.)?[a-zA-Z0-9-]+(?:\.[a-zA-Z]{2,})+(?:\/\S*)?$/)) {
        display_message("The supplied URL is invalid.", 'red')
        return false
    }

    return true
}

let allow_processing = true
function process_url() {
    console.log('processing')
    const url = url_input.value
    if (!verify_url(url)) {
        return
    }

    try {
        allow_processing = false
        const response = fetch('/api/process_url', {
            body: JSON.stringify({'url': url}),
            method: 'POST',
            headers: {'Content-Type': 'application/json'}
        }).then(response => response.json())
        console.log(response)
    } catch (e) {
        console.error(`Error occured during URL processing: ${e}`)
        display_message("Error occured during URL processing. Check console for info.", 'red')
    }
    allow_processing = true
}

process_button.addEventListener('click', process_url)
