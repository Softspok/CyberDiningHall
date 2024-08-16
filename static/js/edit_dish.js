document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const dish_id = urlParams.get('dish-id');
    const merchant_account = urlParams.get('m-account');
    let dishData = {};
    let allergensList = [];
    let nutritionList = [];
    let ingredientsList = [];

    const editButton = document.getElementById('editButton');
    const saveButton = document.getElementById('saveButton');
    const cancelButton = document.getElementById('cancelButton');
    const deleteButton = document.getElementById('deleteButton')

    // 获取菜品详细信息
    fetch('/dish_detailed', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ dish_id: dish_id, merchant_account: merchant_account })
    })
    .then(response => response.json())
    .then(data => {
        if (data.length > 0) {
            dishData = data[0];
            displayDishDetails(dishData);
        }
    })
    .catch(error => {
        console.error('Error during get detailed dish:', error);
    });

    // 获取过敏原、营养和成分列表
    fetch('/get_allergens_nutrition_ingredients', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        allergensList = data.allergens;
        nutritionList = data.nutrition;
        ingredientsList = data.ingredients;

        // 在数据加载完成后，监听编辑按钮点击事件
        editButton.addEventListener('click', function() {
            toggleEdit(true);
        });
    })
    .catch(error => {
        console.error('Error during get allergens, nutrition, and ingredients:', error);
    });

    saveButton.addEventListener('click', function() {
        saveDishDetails();
    });

    cancelButton.addEventListener('click', function() {
        window.location.href = `/edit_dish?m-account=${merchant_account}&dish-id=${dish_id}`;
    });
    deleteButton.addEventListener('click', function (){
        if(confirm('确认删除这个菜品吗？')){
            fetch('/delete_dish', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ dish_id: dish_id})
            })
            .then(response => response.text())
            .then(data => {
                if (data === '') {
                    window.location.href = `/manage_menu?m-account=${merchant_account}`
                }
            })
            .catch(error => {
                console.error('Error during get detailed dish:', error);
            });
        }
    })

    function displayDishDetails(dish) {
        document.getElementById('editPictures').textContent = '';
        document.getElementById('dishName').textContent = dish.name;
        document.getElementById('dishPrice').textContent = `价格: ${dish.price} 元`;
        document.getElementById('dishType').textContent = `类别: ${dish.type}`;
        document.getElementById('dishStars').textContent = `评分: ${dish.stars} 星`;
        document.getElementById('dishDescription').textContent = `描述: ${dish.description}`;
        document.getElementById('dishVolume').textContent = `销量: ${dish.volume}`;
        document.getElementById('dishCollectedCnt').textContent = `收藏次数: ${dish.collectedCnt}`;

        const historyList = document.getElementById('history-list');
        historyList.innerHTML = ''; // 清空历史记录容器
        const histories = dish.history;
        if(histories !== null && histories.length > 0) {
            histories.forEach(history => {
                const historyItem = document.createElement('li');
                historyItem.innerHTML = `${history.time} - ${history.price}`;
                historyList.appendChild(historyItem);
            });
        }

        document.getElementById('dishNutrition').textContent = `营养: ${dish.nutrition}`;
        document.getElementById('dishIngredients').textContent = `成分: ${dish.ingredients}`;
        document.getElementById('dishAllergens').textContent = `过敏原: ${dish.allergens}`;

        const pictures = dish.pictures;
        const container = document.getElementById('dishPictures');
        container.innerHTML = ''; // 清空图片容器
        if (pictures != null) {
            const imageUrls = pictures.split(' ');
            imageUrls.forEach(function (src) {
                const img = document.createElement('img');
                img.src = src;  // 设置图片源地址
                img.style = 'width:100px; height:auto';
                container.appendChild(img);
            });
        } else {
            const img = document.createElement('img');
            img.src = '../static/image/dish/default.png';
            container.appendChild(img);
        }
    }

    function toggleEdit(isEditing) {
    const elementsToToggle = [
        { id: 'dishName', label: '菜品名称', type: 'text' },
        { id: 'dishPrice', label: '价格', type: 'number' },
        { id: 'dishType', label: '类别', type: 'text' },
        { id: 'dishDescription', label: '描述', type: 'text' },
        { id: 'dishAllergens', label: '过敏原', type: 'checkbox', options: allergensList },
        { id: 'dishNutrition', label: '营养', type: 'checkbox', options: nutritionList },
        { id: 'dishIngredients', label: '成分', type: 'checkbox', options: ingredientsList }
    ];

    elementsToToggle.forEach(item => {
        const element = document.getElementById(item.id);
        if (isEditing) {
            if (item.type === 'checkbox') {
                const container = document.createElement('div');
                container.id = item.id + 'CheckboxGroup';
                item.options.forEach(option => {
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.id = item.id + '_' + option;
                    checkbox.value = option;

                    const label = document.createElement('label');
                    label.textContent = option;
                    label.htmlFor = checkbox.id;

                    container.appendChild(checkbox);
                    container.appendChild(label);
                    container.appendChild(document.createElement('br'));
                });
                element.replaceWith(container);

                const label = document.createElement('label');
                label.textContent = `选择${item.label}:`;
                label.htmlFor = container.id;
                container.insertAdjacentElement('beforebegin', label);
            } else {
                // 其他类型的处理（文本框、下拉框）
                const input = document.createElement('input');
                input.type = item.type || 'text';
                input.id = item.id + 'Input';
                input.value = dishData[item.id]; // 使用当前菜品数据填充输入框的值
                element.replaceWith(input);

                const label = document.createElement('label');
                label.textContent = `修改${item.label}:`;
                label.htmlFor = input.id;
                input.insertAdjacentElement('beforebegin', label);
            }
        } else {
            const span = document.createElement('span');
            span.id = item.id;
            if (item.type === 'checkbox') {
                const selectedOptions = dishData[item.id];
                if (selectedOptions && selectedOptions.length > 0) {
                    span.textContent = `${item.label}: ${selectedOptions.join(', ')}`;
                } else {
                    span.textContent = `${item.label}: 无`;
                }
            } else {
                span.textContent = `${item.label}: ${dishData[item.id]}`;
            }
            element.replaceWith(span);

            const label = document.querySelector(`label[for=${item.id + 'Input'}], label[for=${item.id + 'Select'}]`);
            if (label) label.remove();
        }
    });

    editButton.style.display = isEditing ? 'none' : 'inline-block';
    saveButton.style.display = isEditing ? 'inline-block' : 'none';
    cancelButton.style.display = isEditing ? 'inline-block' : 'none';

    if (isEditing) {
        const imgInput = document.createElement('input');
        imgInput.type = 'file';
        imgInput.id = 'dishImageInput';
        imgInput.accept = 'image/*';
        document.getElementById('editPictures').appendChild(imgInput);

        const imgLabel = document.createElement('label');
        imgLabel.textContent = '修改图片:';
        imgLabel.htmlFor = imgInput.id;
        imgInput.insertAdjacentElement('beforebegin', imgLabel);
    } else {
        const imgInput = document.getElementById('dishImageInput');
        if (imgInput) imgInput.remove();
        const imgLabel = document.querySelector(`label[for=dishImageInput]`);
        if (imgLabel) imgLabel.remove();
    }
}



    function saveDishDetails() {
    const updatedDish = {
        dish_id: dish_id,
        merchant_account: merchant_account,
        name: null,
        price: null,
        type: null,
        description: null,
        allergens: [],
        nutrition: [],
        ingredients: [],
        pictures: null
    };

    const nameInput = document.getElementById('dishNameInput');
    if (nameInput) {
        updatedDish.name = nameInput.value;
    }

    const priceInput = document.getElementById('dishPriceInput');
    if (priceInput) {
        updatedDish.price = parseFloat(priceInput.value);
    }

    const typeInput = document.getElementById('dishTypeInput');
    if (typeInput) {
        updatedDish.type = typeInput.value;
    }

    const descriptionInput = document.getElementById('dishDescriptionInput');
    if (descriptionInput) {
        updatedDish.description = descriptionInput.value;
    }

    const allergensCheckboxes = document.querySelectorAll('input[type=checkbox][id^=dishAllergens_]:checked');
    allergensCheckboxes.forEach(checkbox => {
        updatedDish.allergens.push(checkbox.value);
    });

    const nutritionCheckboxes = document.querySelectorAll('input[type=checkbox][id^=dishNutrition_]:checked');
    nutritionCheckboxes.forEach(checkbox => {
        updatedDish.nutrition.push(checkbox.value);
    });

    const ingredientsCheckboxes = document.querySelectorAll('input[type=checkbox][id^=dishIngredients_]:checked');
    ingredientsCheckboxes.forEach(checkbox => {
        updatedDish.ingredients.push(checkbox.value);
    });

    const imgInput = document.getElementById('dishImageInput');
    if (imgInput && imgInput.files.length > 0) {
        const formData = new FormData();
        formData.append('folder', 'dish');
        formData.append('files', imgInput.files[0]);

        fetch('/save_picture', {
            method: 'POST',
            body: formData
        })
        .then(response => response.text())
        .then(imageUrls => {
            updatedDish.pictures = imageUrls.split(' '); // 假设返回的是一个图片URL数组
            updateDishDetails(updatedDish);
        })
        .catch(error => {
            console.error('上传图片出错:', error);
            alert('图片上传失败');
        });
    } else {
        updateDishDetails(updatedDish);
    }
}


    function updateDishDetails(updatedDish) {
        fetch('/edit_dish', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedDish)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }
            return response.text();  // 处理响应体为文本，即使它是空的
        })
        .then(text => {
            if (text === '') {
                alert('菜品信息更新成功');
                window.location.href = `/edit_dish?m-account=${merchant_account}&dish-id=${dish_id}`;
            } else {
                alert('编辑失败');
            }
        })
        .catch(error => {
            console.error('更新商品信息出错:', error);
            alert('菜品信息更新过程中发生错误');
        });
    }
});
