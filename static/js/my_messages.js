document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const account = urlParams.get('c-account');
    fetch('/all_messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ account: account })
    })
    .then(response => response.json())
    .then(data => {
        const messageList = document.getElementById('message-list');
        if (data.error) {
            messageList.innerHTML = `<li>Error: ${data.error}</li>`;
        } else {
            data.forEach(message => {
                const messageItem = document.createElement('li');
                messageItem.innerHTML = `
                    <p>Text: ${message.text}</p>
                    <p>Time: ${new Date(message.time).toLocaleString()}</p>
                    <p>Merchant Name: ${message.merchant_name}</p>
                `;
                messageList.appendChild(messageItem);
            });
        }
    })
    .catch(error => {
        console.error('Error:', error);
        const messageList = document.getElementById('message-list');
        messageList.innerHTML = `<li>Error: ${error}</li>`;
    });
});

