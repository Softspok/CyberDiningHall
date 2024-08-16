const urlParams = new URLSearchParams(window.location.search);
const customer_account = urlParams.get('c-account');

fetch('/view_collect', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ account: customer_account })
})
    .then(response => response.json())
    .then(data => {
        const merchantList = document.getElementById('merchant-list');
        const dishList = document.getElementById('dish-list');

        data.forEach(item => {
            if (item.dish_id) {
                const dishItem = document.createElement('li');
                dishItem.innerHTML = `
                <p>Name: ${item.dish_name}</p>
                <p>Description: ${item.dish_introduction}</p>
                <p>Merchant Name: ${item.merchant_name}</p>
                <p>Offline Volume: ${item.offline_volume}</p>
                <p>Recent Volume: ${item.recent_volume}</p>
            `;
                dishItem.addEventListener('click', () => {
                    window.location.href = `/dish_detailed?c-account=${customer_account}&m-account=${item.merchant_account}&dish-id=${item.dish_id}`;
                });
                dishList.appendChild(dishItem);
            } else {
                const merchantItem = document.createElement('li');
                merchantItem.innerHTML = `
                <p>Name: ${item.merchant_name}</p>
                <p>Introduction: ${item.merchant_introduction}</p>
            `;
                merchantItem.addEventListener('click', () => {
                    window.location.href = `/merchant_detailed?c-account=${customer_account}&m-account=${item.merchant_account}`;
                });
                merchantList.appendChild(merchantItem);
            }
        });
    })
    .catch(error => {
        console.error('Error:', error);
    });
