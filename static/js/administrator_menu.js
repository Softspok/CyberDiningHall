document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const customer_account = urlParams.get('c-account');
    const merchant_account = urlParams.get('m-account');

    /*---------------加载商户详细信息-----------------*/
    fetch('/merchant_detailed', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({account: merchant_account})
    })
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                const merchant = data[0];
                document.getElementById('merchantName').textContent = merchant.name;
            } else {
                document.getElementById('merchantName').textContent = '商户信息未找到';
            }
        })
        .catch(error => {
            console.error('Error loading merchant details:', error);
            document.getElementById('merchantName').textContent = '加载商户信息时发生错误';
        });

    /*---------------菜单-----------------*/
    fetch('/menu_handler', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ account: merchant_account })
    })
        .then(response => response.json())
        .then(data => {
            const menuContainer = document.getElementById('menuContainer');
            if (data.length > 0) {
                data.forEach(dish => addDishToMenu(dish, menuContainer));
            } else {
                menuContainer.innerHTML = '<p>此商户暂无菜单信息。</p>';
            }
        })
        .catch(error => {
            console.error('Error loading menu:', error);
            menuContainer.innerHTML = '<p>加载菜单时发生错误。</p>';
        });

    /*---------------处理菜品计数-----------------*/
    const menuContainer = document.getElementById('menuContainer');
    let dishCounts = {};

    menuContainer.addEventListener('click', function(event) {
        let target = event.target;
        let dishDiv = target.closest('.dish-item');
        if (!dishDiv) return;

        let dishId = dishDiv.dataset.dishId;
        if (target.classList.contains('add-btn')) {
            dishCounts[dishId] = (dishCounts[dishId] || 0) + 1;
        } else if (target.classList.contains('subtract-btn') && dishCounts[dishId] > 0) {
            dishCounts[dishId]--;
        } else if (!target.classList.contains('add-btn') && !target.classList.contains('subtract-btn')) {
            // 点击除增减按钮之外的部分跳转到菜品详情页
            window.location.href = `/administrator_dish_detailed?c-account=${customer_account}&m-account=${merchant_account}&dish-id=${dishId}`;
            return;
        }


        updateCountDisplay(dishDiv, dishId);
        updateTotalPrice();
    });

    function updateCountDisplay(dishDiv, dishId) {
        let countDisplay = dishDiv.querySelector('.count-display');
        let subtractBtn = dishDiv.querySelector('.subtract-btn');
        if (dishCounts[dishId] > 0) {
            countDisplay.textContent = `x${dishCounts[dishId]}`;
            subtractBtn.style.display = 'inline-block';
        } else {
            countDisplay.textContent = '';
            subtractBtn.style.display = 'none';
        }
    }

    function updateTotalPrice() {
        let totalPrice = 0;
        Object.keys(dishCounts).forEach(dishId => {
            let price = parseFloat(document.querySelector(`[data-dish-id="${dishId}"]`).dataset.price);
            totalPrice += dishCounts[dishId] * price;
        });
        document.getElementById('totalPrice').textContent = `总金额: ￥${totalPrice.toFixed(2)}`;
    }

    /*---------------处理订单提交-----------------*/
    document.querySelector('.button').addEventListener('click', function() {
        if (Object.keys(dishCounts).length > 0 && Object.values(dishCounts).some(value => value !== 0)){
            const formattedTime = formatDateForMySQL(new Date());

            fetch('/new_order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    customer_account: customer_account,
                    merchant_account: merchant_account,
                    dish_counts: dishCounts,
                    time: formattedTime
                })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        alert(`订单创建失败: ${data.error}`);
                    } else {
                        alert(`订单创建成功，将返回主页! 订单ID:${data.order_id}`);
                        setTimeout(function() {
                            window.location.href = `/customer_homepage?c-account=${customer_account}`;
                        }, 5000); // 5秒后跳转
                    }
                })
                .catch(error => {
                    console.error('Error creating order:', error);
                    alert('订单提交过程中发生错误');
                });
        } else {
            alert("至少点一个菜！")
        }
    });

    function formatDateForMySQL(date) {
        const pad = (num) => num.toString().padStart(2, '0');
        //date.setUTCHours(date.getUTCHours() + 8);
        return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;
    }

});

function addDishToMenu(dish, menuContainer) {
    const dishDiv = document.createElement('div');
    const pictures = dish.pictures;
    let src = '../static/image/dish/default.png';
    if (pictures != null) {
        const imageUrls = pictures.split(' ');
        src = imageUrls[0];
    }
    dishDiv.className = 'dish-item';
    dishDiv.innerHTML = `
        <h3>${dish.name}</h3>
        <img src=${src} alt="Default Image" style="width:100px; height: auto;">
        <p>价格: ${dish.price} 元</p>
        <p>类别: ${dish.type}</p>
        <p>评分: ${dish.stars} 星</p>
    `;
    dishDiv.dataset.price = dish.price;
    dishDiv.dataset.dishId = dish.dish_id;
    menuContainer.appendChild(dishDiv);
}

/*---------------处理菜品搜索-----------------*/
function search() {
    const searchText = document.getElementById('search').value;
    const urlParams = new URLSearchParams(window.location.search);
    const merchant_account = urlParams.get('m-account');
    const menuContainer = document.getElementById('menuContainer');

    if (searchText.trim()) {
        fetch('/search_dish', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ merchant_account: merchant_account, search: searchText })
        })
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    menuContainer.innerHTML = '';
                    data.forEach(dish => addDishToMenu(dish, menuContainer));
                } else {
                    menuContainer.innerHTML = '<p>没有符合搜索条件的菜品。</p>';
                }
            })
            .catch(error => {
                console.error('Error loading menu:', error);
                menuContainer.innerHTML = '<p>搜索菜品时发生错误。</p>';
            });
    } else {
        alert('请输入搜索内容');
        fetch('/menu_handler', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ account: merchant_account })
        })
            .then(response => response.json())
            .then(data => {
                const menuContainer = document.getElementById('menuContainer');
                if (data.length > 0) {
                    data.forEach(dish => addDishToMenu(dish, menuContainer));
                } else {
                    menuContainer.innerHTML = '<p>此商户暂无菜单信息。</p>';
                }
            })
            .catch(error => {
                console.error('Error loading menu:', error);
                menuContainer.innerHTML = '<p>加载菜单时发生错误。</p>';
            });
    }
}