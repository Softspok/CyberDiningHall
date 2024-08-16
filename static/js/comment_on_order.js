const urlParams = new URLSearchParams(window.location.search);
const customer_account = urlParams.get('c-account');
const merchant_account = urlParams.get('m-account');
const order_id = urlParams.get('order-id');

function loadOrderDetails() {
    fetch('/order_detailed', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({order_id: order_id})
    })
        .then(response => response.json())
        .then(data => {
            const order = data[0];
            document.getElementById('merchantName').textContent = order.merchant_name;

            const dish_ids = order.dish_ids

            const dishesList = document.getElementById('dishesList');
            let i = 0;
            order.dishes.forEach(dish => {
                const dishName = Object.keys(dish)[0]; // 获取对象的键，即菜品名称
                const dishCount = dish[dishName]; // 使用键获取菜品数量
                const dishId = dish_ids[i][dishName];
                i = i + 1;

                const dishItem = document.createElement('li');
                dishItem.setAttribute('data-dish-id', dishId); // 设置 data-dish-id 属性
                dishItem.innerHTML = `
                    ${dishName} x ${dishCount}
                    <div>
                        <button onclick="changeScore(this, -1)">-</button>
                        <span class="score">10</span> 分
                        <button onclick="changeScore(this, 1)">+</button>
                    </div>
                `;
                dishesList.appendChild(dishItem);
            });
        })
        .catch(error => console.error('Error loading order details:', error));
}

function changeScore(button, change) {
    const scoreSpan = button.parentNode.querySelector('.score');
    let score = parseInt(scoreSpan.textContent);
    score = Math.max(1, Math.min(10, score + change));
    scoreSpan.textContent = score;
}

function submitComment() {
    const dishesElements = document.querySelectorAll('#dishesList li');
    let totalScore = 0;
    let count = 0;
    const dish_stars = {};

    dishesElements.forEach(dishElement => {
        const dishId = dishElement.getAttribute('data-dish-id');
        const score = parseInt(dishElement.querySelector('.score').textContent);
        dish_stars[dishId] = score;
        totalScore += score;
        count++;
    });

    const stars = count > 0 ? totalScore / count : 0; // 计算平均分
    const orderComment = document.getElementById('orderComment').value;
    uploadImages();
    const pictures = document.getElementById('picturesInput').value;

    fetch('/publish_comments', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            sender: customer_account,
            order_id: order_id,
            stars: stars, // 订单平均分
            dish_stars: dish_stars, // 各菜品评分
            text: orderComment,
            pictures: pictures
        })
    })
        .then(response => response.json())
        .then(result => {
            alert('评论已提交!');
            window.location.href = `/my_orders?c-account=${customer_account}`;
        })
        .catch(error => console.error('Error submitting comment:', error));
}

function uploadImages() {
    const files = document.getElementById('imageUpload').files;
    if (files.length === 0) {
        return;
    }
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
    }
    formData.append('folder', 'comment');

    fetch('/save_picture', {
        method: 'POST',
        body: formData
    })
        .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }
        return response.text();
    })
        .then(path => {
            document.getElementById('picturesInput').value = path;
            alert('图片上传成功！');
        })
        .catch(error => {
            console.error('Error uploading image:', error);
            alert('图片上传失败');
        });
}

// 页面加载时获取订单详情
window.onload = loadOrderDetails;
