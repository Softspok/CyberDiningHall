const urlParams = new URLSearchParams(window.location.search);
const account = urlParams.get('m-account');


fetch('/merchant_all_orders', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ account: account })
})
    .then(response => response.json())
    .then(data => {
        const commentList = document.getElementById('comment-list');
        data.forEach(order => {
            const commentItem = document.createElement('li');
            // 如果已评论
            if(order.status !== 2){
                return;
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
            commentItem.innerHTML = `
            <p>Order Time: ${order.time}</p>
            `;
            commentItem.appendChild(dishesList);  // 在设置innerHTML后添加dishesList
            commentItem.innerHTML += `
                <p>Total Price: ${order.total_price}</p>
            `;

            fetch('/received_comments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ order_id: order.order_id })
            }).then(response => response.json())
                .then(data => {
                    const comment = data[0];

                    // 处理图片显示
                    let imagesOutput = "";
                    if (comment.pictures) {
                        const imageUrls = comment.pictures.split(' ');
                        imageUrls.forEach(function(src) {
                            imagesOutput += `<img src="${src}" alt="Comment Image" style="width:100px; height: auto;">`;
                        });
                    }

                    commentItem.innerHTML += `
                        <p>Customer: ${comment.name}</p>
                        <p>${imagesOutput}</p>
                        <p>Stars: ${comment.stars}</p>
                        <p>Text: ${comment.text}</p>
                        <p>Time: ${comment.time}</p>
                        <hr>
                    `;
                    commentList.appendChild(commentItem)
                })
                .catch(error => {
                console.error('/received_comments error:', error);
            });
            commentList.appendChild(commentItem);
        });
    })
    .catch(error => {
        console.error('Error:', error);
    });