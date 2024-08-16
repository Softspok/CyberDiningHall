document.addEventListener('DOMContentLoaded', function() {
    const customerList = document.querySelector('.customer-list');

    // 加载所有用户信息
    fetch('/get_all_customer', { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            data.forEach(customer => {
                // 创建用户信息显示区域
                const customerDiv = document.createElement('div');
                customerDiv.className = 'customer-item'; // 为每个用户设置类名以便应用 CSS
                customerDiv.innerHTML = `
                    <h3>${customer.name}</h3>
                    <p>Account: ${customer.account}</p>
                    <p>Gender: ${customer.gender}</p>
                    <p>Age: ${customer.age}</p>
                    <p>Address: ${customer.address}</p>
                    <p>Major: ${customer.major}</p>
                    <button class="edit-customer">编辑</button>
                    <button class="delete-customer">删除</button>
                `;
                customerList.appendChild(customerDiv);

                // 编辑事件监听器
                customerDiv.querySelector('.edit-customer').addEventListener('click', () => {
                    editCustomer(customer.account);
                });

                // 删除事件监听器
                customerDiv.querySelector('.delete-customer').addEventListener('click', () => {
                    deleteCustomer(customer.account, customerDiv);
                });
            });
        })
        .catch(error => console.error('Error loading customers:', error));

    // 编辑用户信息函数
    function editCustomer(account) {
        window.location.href = `/edit_customer_information?c-account=${account}`;
    }

    // 删除用户函数
    function deleteCustomer(account, customerDiv) {
        if (confirm('确定要删除这个用户吗？')) {
            fetch('/delete_customer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ account: account }),
            })
            .then(response => {
                if (response.ok) {
                    customerDiv.remove(); // 成功删除后从页面移除该用户信息
                } else {
                    alert('删除用户失败');
                }
            })
            .catch(error => {
                console.error('Error deleting customer:', error);
                alert('删除用户失败');
            });
        }
    }
});
