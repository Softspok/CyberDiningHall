document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const account = urlParams.get('c-account');

    fetch('/customer_all_comments', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ account: account })
    })
        .then(response => response.json())
        .then(data => {
            const commentList = document.getElementById('comment-list');

            data.forEach(comment => {
                const commentItem = document.createElement('li');
                const dishes = comment.dishes[0];

                let dishesOutput = "Dishes:<br>";
                Object.keys(dishes).forEach(dish => {
                    dishesOutput += `${dish}: ${dishes[dish]}份<br>`;  // 添加每个菜品的名称和数量
                });

                // 处理图片显示
                let imagesOutput = "";
                if (comment.pictures) {
                    const imageUrls = comment.pictures.split(' ');
                    imageUrls.forEach(function(src) {
                        imagesOutput += `<img src="${src}" alt="Comment Image" style="width:100px; height: auto;">`;
                    });
                } else {
                    imagesOutput = `<img src="../static/image/dish/default.png" alt="Default Image" style="width:100px; height: auto;">`;
                }

                commentItem.innerHTML = `
                <p>Merchant: ${comment.merchant_name}</p>
                <p>${dishesOutput}</p>
                <p>${imagesOutput}</p>
                <p>Stars: ${comment.stars}</p>
                <p>Text: ${comment.text}</p>
                <p>Time: ${comment.time}</p>
                <hr>
            `;
                commentList.appendChild(commentItem);
            });
        })
        .catch(error => {
            console.error('Error:', error);
        });
});
