document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const account = urlParams.get('m-account');
    if (account) {
        // 向服务器发送请求，获取用户的详细信息
        fetch('/merchant_detailed', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({account: account})
        })
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    const user = data[0];
                    const greetingMessage = generateGreeting(user.name); // 生成问候语
                    const greetingElement = document.getElementById('greeting'); // 用于显示问候语的元素
                    if (greetingElement) {
                        greetingElement.innerHTML = greetingMessage; // 显示问候语
                    }
                }
            })
            .catch(error => {
                console.error('Error fetching user details:', error);
                const greetingElement = document.getElementById('greeting');
                if (greetingElement) {
                    greetingElement.textContent = '无法加载用户信息';
                }
            });

        fetch('/get_daily_amount', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({account: account})
        })
            .then(response => response.json())
            .then(data => {
                const greetingElement = document.getElementById('greeting'); // 用于显示问候语的元素
                if (greetingElement) {
                    greetingElement.innerHTML += `
                    <p>今日订单数：${data.order_number}</p>
                    <p>流水：${data.amount}</p>
                    `;
                }
            })
            .catch(error => {
                console.error('Error fetching user details:', error);
                const greetingElement = document.getElementById('greeting');
                if (greetingElement) {
                    greetingElement.textContent += '无法加载用户流水';
                }
            });

        fetch('/merchant_all_orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({account: account})
        })
            .then(response => response.json())
            .then(data => {
                const ordersContainer = document.querySelector('.order-todolist');
                ordersContainer.innerHTML = '';  // 清空现有的搜索结果
                if (data.length > 0) {
                    data.forEach(order => {
                        if (order.status !== 0) {
                            return;
                        }
                        const orderElement = document.createElement('div');
                        orderElement.className = 'order-item'; // 设置一个类名用于CSS样式和选择器

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

                        orderElement.innerHTML = `
                            <p>time: ${order.time}</p>
                        `;
                        orderElement.appendChild(dishesList);  // 在设置innerHTML后添加dishesList
                        orderElement.innerHTML += `
                            <p>total price: ${order.total_price}</p>
                            <button onclick="deliver('${order.order_id}', '${order.customer_id}', '${account}')">出餐</button>                        `;
                        ordersContainer.appendChild(orderElement);
                        });
                    }
            })
            .catch(error => {
                console.error('Error fetching merchant orders:', error);
                alert("无法获取订单状态！")
            });
    }
});

function generateGreeting(name) {
    const hour = new Date().getHours();
    let partOfDay;

    if (hour < 12) {
        partOfDay = '早上好';
    } else if (hour < 18) {
        partOfDay = '下午好';
    } else {
        partOfDay = '晚上好';
    }

    return `${name},<br>
            ${partOfDay}！`;
}

function deliver(order_id, customer_account, merchant_account){
    fetch('/finish_order', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ order_id: order_id })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }
            return response.text();  // 处理响应体为文本，即使它是空的
        })
        .then(text => {
            if (text === '') {
                // 空字符串响应意味着成功操作
                window.location.reload();

            } else {
                alert('出餐提交失败');
            }
        })
        .catch(error => {
            console.error('Error during deliver:', error);
            alert('出餐过程中发生错误');
        });
    sendMessage(order_id, customer_account, merchant_account);
}

function sendMessage(order_id, customer_account, merchant_account){
    const data = {
        customer_account: customer_account,
        merchant_account: merchant_account,
        text: '订单已完成，期待您的评价！',
        order_id: order_id,
    };

    fetch('/new_message', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }
            return response.json();  // 假设服务器返回JSON
        })
        .then(result => {
            if (result.message_id) {
                console.log('Message sent successfully. Message ID:', result.message_id);
            } else if (result.error) {
                console.error('Failed to send message:', result.error);
            }
        })
        .catch(error => {
            console.error('Error sending message:', error);
        });
}
