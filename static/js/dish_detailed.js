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

                document.getElementById('dishIngredient').textContent = `成分: ${dish.ingredients}`;
                document.getElementById('dishNutrition').textContent = `营养信息: ${dish.nutrition}`;
                document.getElementById('dishAllergen').textContent = `可能存在的过敏源: ${dish.allergens}`;

                document.getElementById('dishVolume').textContent = `销量: ${dish.volume}`;
                document.getElementById('dishCollectedCnt').textContent = `收藏次数: ${dish.collectedCnt}`;

                const historyList = document.getElementById('history-list');
                const histories = dish.history;
                if(histories !== null && histories.length > 0) {
                    histories.forEach(history => {
                        const historyItem = document.createElement('li');
                            historyItem.innerHTML = `
                                ${history.time} - ${history.price}
                            `;
                        historyList.appendChild(historyItem);
                    });
                }

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

                // 检查是否已经收藏
                fetch('/view_collect', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ account: customer_account })
                })
                    .then(response => response.json())
                    .then(collects => {
                        const collectButton = document.getElementById('collectButton');
                        let isCollected = false;

                        collects.forEach(collect => {
                            if (collect.dish_id != null && collect.dish_id.toString() === dish_id ) {
                                isCollected = true;
                            }
                        });

                        if (isCollected) {
                            collectButton.textContent = '已收藏';
                        } else {
                            collectButton.textContent = '收藏';
                        }

                        collectButton.addEventListener('click', function() {
                            if (isCollected) {
                                // 取消收藏
                                fetch('/delete_collect', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({ account: customer_account, merchant: null, dish_id: dish_id })
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
                                            alert('取消收藏失败');
                                        }
                                    })
                                    .catch(error => {
                                        console.error('Error during delete collect:', error);
                                        alert('取消收藏过程中发生错误');
                                    });

                            } else {
                                // 收藏
                                fetch('/new_collect', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({ account: customer_account, merchant: null, dish_id: dish_id })
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
                                            alert('收藏失败');
                                        }
                                    })
                                    .catch(error => {
                                        console.error('Error during collect:', error);
                                        alert('收藏过程中发生错误');
                                    });
                            }
                        });
                    })
                    .catch(error => {
                        console.error('Error during get collects:', error);
                    });
            }
        })
        .catch(error => {
            console.error('Error during get detailed dish:', error);
        });

    // 显示菜品相关评论
    fetch('/dish_orders', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ dish_id: dish_id })
    })
        .then(response => response.json())
        .then(data => {
            const commentList = document.getElementById('comment-list');
            if(data.length > 0){
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
                            <p>Customer: ${comment.name}</p> `;
                            commentItem.appendChild(dishesList);
                            commentItem.innerHTML += `
                            <p>${imagesOutput}</p>
                            <p>Stars: ${comment.stars}</p>
                            <p>Text: ${comment.text}</p>
                            <p>Comment time: ${comment.time}</p>
                            <hr>
                        `;
                            commentList.appendChild(commentItem)
                        })
                        .catch(error => {
                            console.error('/received_comments error:', error);
                        });
                    commentList.appendChild(commentItem);
                });
            }else{

            }
        })
        .catch(error => {
            console.error('Error:', error);
        });

});