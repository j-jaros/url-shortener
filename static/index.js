const url_input = document.querySelector('input')
const message_holder = document.getElementById('message')
const process_button = document.querySelector('button')
const result_holder = document.querySelector('.result-holder h3')
const shorten_again = document.querySelector('.container a')

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

url_input.addEventListener('input', e => {
    verify_url(true)
})

function verify_url(silent = false) {
    const url = url_input.value
    let result = true
    if (url.trim() === "") {
        if (!silent) display_message("You can't shorten an empty URL.", 'red', 5)
        result = false
    }

    if (!url.match(/^(?:\w+:\/\/)?(?:www\.)?[a-zA-Z0-9-]+(?:\.[a-zA-Z]{2,})+(?:\/\S*)?$/)) {
        if (!silent) display_message("The supplied URL is invalid.", 'red')
        result = false
    }

    if (result) {
        process_button.classList.add("ready")
        allow_processing = true
    } else {
        process_button.classList.remove("ready")
        allow_processing = false
    }

    return result
}

let allow_processing = false

async function process_url() {
    if (!allow_processing) return

    const url = url_input.value
    if (!verify_url()) return

    try {
        allow_processing = false
        let responseData;
        const xhr = new XMLHttpRequest()
        xhr.open("POST", "/api/process_url")
        xhr.setRequestHeader('Content-Type', 'application/json')
        xhr.send(JSON.stringify({'url': url}))

        xhr.onload = () => {
            responseData = JSON.parse(xhr.responseText)
            switch (responseData['code']) {
                case 'invalid-url':
                    display_message("Invalid url.", 'red',)
                    break
                case 'completed':
                    display_message('Url is ready!', 'green')
                    console.log(result_holder.parentElement)
                    result_holder.parentElement.classList.add('visible')
                    result_holder.textContent = responseData['ref']
                    shorten_again.classList.add("visible")
                    break
                default:
                    display_message(`Unknow response: ${responseData['code']}`, 'grey')
            }
        }
    } catch (e) {
        console.error(`Error occured during URL processing: ${e}`)
        display_message("Error occured during URL processing. Check console for info.", 'red')
    }
    url_input.value = ""
    verify_url()
    allow_processing = true
}

process_button.addEventListener('click', process_url)

// a function that copies the shortened link when it is clicked
document.querySelector('.result-holder h3').addEventListener('click', e => {
    e.preventDefault()
    navigator.clipboard.writeText(e.target.textContent)
    alert("Link copied!")
})

shorten_again.addEventListener('click', reset)

function reset() {
    shorten_again.classList.remove('visible')
    result_holder.parentElement.classList.remove('visible')
    message_holder.textContent = ""
    result_holder.textContent = ""
}