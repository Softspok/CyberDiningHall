document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const account = urlParams.get('c-account');

    fetch('/customer_reserve', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ account: account })
    })
        .then(response => response.json())
        .then(data => {
            const reserveList = document.getElementById('reserve-list');

            data.forEach(reserve => {
                const reserveItem = document.createElement('li');
                reserveItem.innerHTML = `
                <p>Merchant: ${reserve.merchant_name}</p>
                <p>Time: ${reserve.time}</p>
                <hr>
            `;
                reserveList.appendChild(reserveItem);
            });
        })
        .catch(error => {
            console.error('Error:', error);
        });
})
