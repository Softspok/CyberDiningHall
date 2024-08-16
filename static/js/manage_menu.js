document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
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
            window.location.href = `/edit_dish?m-account=${merchant_account}&dish-id=${dishId}`;
            return;
        }


        updateCountDisplay(dishDiv, dishId);
        updateTotalPrice();
    });



    /*---------------处理添加菜品表单提交-----------------*/
    document.getElementById('newDishForm').addEventListener('submit', function(event) {
        event.preventDefault();

        const files = document.getElementById('imageUpload').files;
        const picturesFormData = new FormData();
        if (files.length === 0) {
            // 不处理
        }
        else {
            for (let i = 0; i < files.length; i++) {
                picturesFormData.append('files', files[i]);
            }
            picturesFormData.append('folder', 'dish');
        }

        fetch('/save_picture', {
            method: 'POST',
            body: picturesFormData
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok.');
                }
                return response.text();
            })
            .then(path => {
                if(path === ''){
                    path = null;
                }
                const formData = new FormData(this);
                const dishData = {
                    merchant_account: merchant_account,
                    dish_name: formData.get('dish_name'),
                    dish_price: formData.get('dish_price'),
                    dish_description: formData.get('dish_description'),
                    pictures: path,
                    type: formData.get('type')
                };

                fetch('/new_dish', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(dishData)
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.error) {
                            alert(`添加菜品失败: ${data.error}`);
                        } else {
                            alert(`菜品添加成功! 菜品ID: ${data.dish_id}`);
                            document.getElementById('newDishForm').reset();
                            location.reload(); // 刷新页面以显示新添加的菜品
                        }
                    })
                    .catch(error => {
                        console.error('Error adding dish:', error);
                        alert('添加菜品过程中发生错误');
                    });
            })
            .catch(error => {
                console.error('Error uploading image:', error);
                alert('图片上传失败');
            });
    });
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
        <img src=${src} alt="Default Image" style="width:auto; height: 150px; max-width: 230px;">
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