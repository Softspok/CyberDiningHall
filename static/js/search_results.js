document.addEventListener('DOMContentLoaded', function() {
    // 页面加载时从URL获取搜索词并搜索
    const urlParams = new URLSearchParams(window.location.search);
    const encodedSearchText = urlParams.get('search');
    const searchText = decodeURIComponent(encodedSearchText);
    if (searchText) {
        performSearch(searchText);
    }

    // 为搜索按钮绑定点击事件
    document.querySelector('.search-bar button').addEventListener('click', function() {
        const inputText = document.getElementById('search').value;
        if (inputText.trim()) {
            performSearch(inputText);
            // 更新 URL 中的搜索词
            window.history.pushState({}, '', `?search=${encodeURIComponent(inputText)}`);
        } else {
            alert('请输入搜索内容');
        }
    });
});

function performSearch(searchText) {
    fetch('/search_merchant_brief', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({text: searchText})
    })
        .then(response => response.json())
        .then(data => {
            displayResults(data);
        })
        .catch(error => {
            console.error('Error during search:', error);
            alert('搜索失败');
        });
}

function displayResults(merchants) {
    const resultsContainer = document.querySelector('.search-results');
    resultsContainer.innerHTML = '';  // 清空现有的搜索结果
    if (merchants.length > 0) {
        merchants.forEach(merchant => {
            const merchantElement = document.createElement('div');
            merchantElement.className = 'merchant-item'; // 设置一个类名用于CSS样式和选择器
            merchantElement.innerHTML = `
                <h3>${merchant.name}</h3>
                <p>简介: ${merchant.introduction || '无详细介绍'}</p>
            `;
            resultsContainer.appendChild(merchantElement);

            // 添加点击事件监听器
            merchantElement.addEventListener('click', () => {
                const urlParams = new URLSearchParams(window.location.search);
                const account = urlParams.get('c-account');
                if(account)
                    window.location.href = `/merchant_detailed?c-account=${account}&m-account=${merchant.account}`; // 点击后跳转到详细页面
                else
                    window.location.href = `/index`;
            });
        });
    } else {
        resultsContainer.innerHTML = '<p>没有找到相关商家。</p>';
    }
}

