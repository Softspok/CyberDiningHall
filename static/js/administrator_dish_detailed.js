document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const customer_account = urlParams.get('c-account');
    const merchant_account = urlParams.get('m-account');
    const dish_id = urlParams.get('dish-id')
    fetch('/dish_detailed',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({dish_id: dish_id, merchant_account: merchant_account})
    })
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                const dish = data[0];
                document.getElementById('dishName').textContent = dish.name;
                document.getElementById('dishPrice').textContent = `价格: ${dish.price} 元`;
                document.getElementById('dishType').textContent = `类别: ${dish.type}`;
                document.getElementById('dishStars').textContent = `评分: ${dish.stars} 星`;
                document.getElementById('dishDescription').textContent = `描述: ${dish.description}`;
                document.getElementById('dishVolume').textContent = `销量: ${dish.volume}`;
                document.getElementById('dishCollectedCnt').textContent = `收藏次数: ${dish.collectedCnt}`;
                document.getElementById('dishHistory').textContent = `历史: ${dish.history}`;

                const pictures = dish.pictures;
                const container = document.getElementById('dishPictures');
                if (pictures != null) {
                    const imageUrls = pictures.split(' ');
                    imageUrls.forEach(function (src) {
                        const img = document.createElement('img');
                        img.src = src;  // 设置图片源地址
                        container.appendChild(img);
                    });
                } else {
                    const img = document.createElement('img');
                    img.src = '../static/image/dish/default.png';                        container.appendChild(img);
                    container.appendChild(img);
                }
            }
        })
        .catch(error => {
            console.error('Error during get detailed dish:', error);
        });
});