document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const account = urlParams.get('c-account');
    if (account) {
        // 向服务器发送请求，获取用户的详细信息
        fetch('/customer_detailed', {
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
                        greetingElement.textContent = greetingMessage; // 显示问候语
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
    }

    fetch('/random_merchant_brief', { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            const merchantList = document.querySelector('.merchant-list');
            merchantList.innerHTML = '';  // 清空现有的列表
            data.forEach(merchant => {
                const merchantDiv = document.createElement('div');
                merchantDiv.className = 'merchant-item'; // 为每个商户设置一个类名以便应用 CSS
                merchantDiv.innerHTML = `<h3>${merchant.name}</h3><p>${merchant.introduction}</p>`;
                merchantList.appendChild(merchantDiv);

                // 添加点击事件监听器
                merchantDiv.addEventListener('click', () => {
                    const urlParams = new URLSearchParams(window.location.search);
                    const customerAccount = urlParams.get('c-account'); // 获取 URL 参数中的客户账号
                    window.location.href = `/merchant_detailed?c-account=${customerAccount}&m-account=${merchant.account}`;
                });
            });
        })
        .catch(error => console.error('Error loading merchants:', error));
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
    return `${name}, ${partOfDay}！`;
}
function search() {
    const searchText = document.getElementById('search-input').value;
    if (searchText.trim()) {
        const urlParams = new URLSearchParams(window.location.search);
        const account = urlParams.get('c-account');
        if(account)
            window.location.href = `/search_results?c-account=${account}&search=${searchText}`;
        else
            window.location.href = `/index`;
    } else {
        alert('请输入搜索内容');
    }
}
