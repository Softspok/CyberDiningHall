const urlParams = new URLSearchParams(window.location.search);
const account = urlParams.get('c-account');

fetch('/customer_all_orders', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ account: account })
})
.then(response => response.json())
.then(data => {
    const orderList = document.getElementById('order-list');

    data.forEach(order => {
        const orderItem = document.createElement('li');
        let status_text = '';
        switch (order.status) {
            case 0: status_text = '未出餐';break;
            case 1: status_text = '已完成 待评论';break;
            case 2: status_text = '已评论';break;
            default:status_text = '错误的状态';break;
        }

        const dishesList = document.createElement('div');
        dishesList.className = 'dishesList';
        order.dishes.forEach(dish => {
            const dishName = Object.keys(dish)[0]; // 获取对象的键，即菜品名称
            const dishCount = dish[dishName]; // 使用键获取菜品数量

            const dishItem = document.createElement('li');
            dishItem.innerHTML = `
                    ${dishName} x ${dishCount}
                `;
            dishesList.appendChild(dishItem);
        });

        orderItem.innerHTML = `
            <p>Time: ${order.time}</p>
        `;
        orderItem.appendChild(dishesList);  // 在设置innerHTML后添加dishesList
        orderItem.innerHTML += `
            <p>Total Price: ${order.total_price}</p>
            <p>Status: ${status_text}</p>
            <p>Merchant Name: ${order.merchant_name}</p>
        `;

        orderItem.addEventListener('click', () => {
            if (order.status === 1) {
                window.location.href = `/comment_on_order?c-account=${account}&m-account=${order.merchant_account}&order-id=${order.order_id}`;
            }
        });
        orderList.appendChild(orderItem);
    });
})
.catch(error => {
    console.error('Error:', error);
});