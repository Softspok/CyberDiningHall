const urlParams = new URLSearchParams(window.location.search);
const account = urlParams.get('m-account');

document.addEventListener('DOMContentLoaded', function() {
    // 加载菜品数据
    loadDishes(account);
    // 显示菜品数据表格
    showDishes(); // 默认显示菜品数据表格
});

function loadDishes(account) {
    const table = document.getElementById('dishesTable').getElementsByTagName('tbody')[0];
    fetch(`/analyze_dish_data`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({account: account})
    })
        .then(response => response.json())
        .then(data => {
            data.forEach(detailedDish => {
                let row = table.insertRow();
                let cell1 = row.insertCell(0);
                let cell2 = row.insertCell(1);
                let cell3 = row.insertCell(2);
                let cell4 = row.insertCell(3);
                let cell5 = row.insertCell(4);
                cell1.textContent = detailedDish.dish_id;
                cell2.textContent = detailedDish.dish_name;
                cell3.textContent = detailedDish.stars;
                cell4.textContent = detailedDish.volume;
                cell5.textContent = detailedDish.most_interested_customer;
            });
        })
        .catch(error => console.error('Error fetching detailed data:', error));
}

function showDishes() {
    document.getElementById('dishesTable').style.display = '';
    document.getElementById('customersTable').style.display = 'none';
}

function showCustomers() {
    const customersTable = document.getElementById('customersTable');
    document.getElementById('dishesTable').style.display = 'none';
    customersTable.style.display = '';

    // 只在第一次点击时加载数据
    if (customersTable.getElementsByTagName('tbody')[0].childElementCount === 0) {
        loadRegularCustomers();
    }
}

function loadRegularCustomers() {

    fetch( `/get_regular_customer_purchase_distribution`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({merchant_account: account})
    })
        .then(response => response.json())
        .then(customers => {
            const table = document.getElementById('customersTable').getElementsByTagName('tbody')[0];
            customers.forEach(customer => {
                let row = table.insertRow();
                let cell1 = row.insertCell(0);
                let cell2 = row.insertCell(1);
                cell1.textContent = customer.customer_name;
                cell2.textContent = Object.entries(customer.distribution).map(([dish_name, count]) => `${dish_name}: ${count}`).join(', ');
            });
        })
        .catch(error => console.error('Error:', error));
}
