document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const customer_account = urlParams.get('c-account');
    const merchant_account = urlParams.get('m-account');

    // 获取商户详细信息
    fetch('/merchant_detailed', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ account: merchant_account })
    })
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                const merchant = data[0];
                document.getElementById('merchantName').textContent = merchant.name;
                document.getElementById('merchantIntro').textContent = merchant.introduction;
                document.getElementById('merchantStars').textContent = merchant.stars + " 星级";
                document.getElementById('merchantAddress').textContent = merchant.address;
                document.getElementById('merchantCollectedCnt').textContent = merchant.collectedCnt + " 收藏次数";

                const pictures = merchant.pictures;
                const container = document.getElementById('merchantPictures');
                if (pictures != null) {
                    const imageUrls = pictures.split(' ');
                    imageUrls.forEach(function (src) {
                        const img = document.createElement('img');
                        img.src = src;  // 设置图片源地址
                        container.appendChild(img);
                    });
                }else {
                    const img = document.createElement('img');
                    img.src = '../static/image/merchant/default.png';
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
                            if (collect.merchant_account === merchant_account && collect.dish_id === null ) {
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
                                    body: JSON.stringify({ account: customer_account, merchant: merchant_account })
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
                                    body: JSON.stringify({ account: customer_account, merchant: merchant_account })
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
            console.error('Error during get detailed merchant:', error);
            alert('错误的商户account');
        });

    // 处理查看菜单按钮点击事件
    const menuButton = document.getElementById('menuButton');
    menuButton.addEventListener('click', function() {
        if (customer_account && merchant_account) {
            window.location.href = `/menu?c-account=${customer_account}&m-account=${merchant_account}`;
        } else {
            console.error('Missing account parameters');
            alert('缺少必要的账号参数');
        }
    });

    // 处理预订
    function formatDateForMySQL(date) {
        const pad = (num) => num.toString().padStart(2, '0');
        //date.setUTCHours(date.getUTCHours() + 8);
        return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;
    }

    const reserveButton = document.getElementById('reserveButton');
    reserveButton.addEventListener('click', function() {
        if (customer_account && merchant_account) {
            const formattedTime = formatDateForMySQL(new Date());

            fetch('/reserve',{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    time:formattedTime,
                    merchant_account: merchant_account,
                    customer_account: customer_account
                })
            }).then(response => {
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
                        alert('预订失败');
                    }
                })
                .catch(error => {
                    console.error('Error during reserve:', error);
                    alert('预订过程中发生错误');
                });
        } else {
            console.error('Missing account parameters');
            alert('缺少必要的账号参数');
        }
    });
});
