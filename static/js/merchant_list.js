document.addEventListener('DOMContentLoaded', function() {
    const merchantList = document.querySelector('.merchant-list');

    // 加载所有商户信息
    fetch('/get_all_merchant', { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            data.forEach(merchant => {
                // 创建商户信息显示区域
                const merchantDiv = document.createElement('div');
                merchantDiv.className = 'merchant-item'; // 为每个商户设置类名以便应用 CSS
                merchantDiv.innerHTML = `
                    <h3>${merchant.name}</h3>
                    <p>${merchant.introduction}</p>
                    <button class="view-details">查看详细信息</button>
                    <button class="edit-merchant">编辑</button>
                    <button class="delete-merchant">删除</button>
                `;
                merchantList.appendChild(merchantDiv);

                // 查看详细信息事件监听器
                merchantDiv.querySelector('.view-details').addEventListener('click', () => {
                    const customerAccount = getCustomerAccount(); // 获取客户账号，这里需要你实现获取方式
                    window.location.href = `/administrator_merchant_detailed?c-account=${customerAccount}&m-account=${merchant.account}`;
                });

                // 编辑事件监听器
                merchantDiv.querySelector('.edit-merchant').addEventListener('click', () => {
                    const customerAccount = getCustomerAccount(); // 获取客户账号
                    window.location.href = `/edit_merchant_information?c-account=${customerAccount}&m-account=${merchant.account}`;
                });

                // 删除事件监听器
                merchantDiv.querySelector('.delete-merchant').addEventListener('click', () => {
                    if (confirm('确定要删除这个商户吗？')) {
                        fetch(`/delete_merchant`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ merchant: merchant.account }),
                        })
                            .then(response => {
                                if (response.ok) {
                                    merchantDiv.remove(); // 成功删除后从页面移除该商户信息
                                } else {
                                    alert('删除商户失败');
                                }
                            })
                            .catch(error => {
                                console.error('删除商户失败:', error);
                                alert('删除商户失败');
                            });
                    }
                });
            });
        })
        .catch(error => {
            console.error('加载商户信息失败:', error);
            alert('加载商户信息失败');
        });

    // 获取客户账号的方法，可以根据实际情况实现
    function getCustomerAccount() {
        // 这里假设你有一种方式来获取客户账号，可能是从URL参数或其他地方获取
        // 实际情况可以根据你的需求来实现
        return 'mock-customer-account';
    }
});
