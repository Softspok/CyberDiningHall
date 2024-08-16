const urlParams = new URLSearchParams(window.location.search);
const account = urlParams.get('c-account');
const submitButton = document.getElementById('submit');
submitButton.addEventListener('click', function (event) {
    event.preventDefault();  // 阻止表单的默认提交行为

    const formData = new FormData(document.getElementById('customerForm'));
    fetch('/edit_customer_information', {
        method: 'POST',
        body: JSON.stringify({
            account: account,
            name: formData.get('name') || null,
            password: formData.get('password') || null,
            gender: formData.get('gender') || null,
            age: formData.get('age') || null,
            hometown: formData.get('hometown') || null,
            major: formData.get('major') || null
        }),
        headers: {
            'Content-Type': 'application/json'
        }
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
                window.location.href = `/customer_profile?c-account=${account}`;
            } else {
                alert('编辑失败');
            }
        })
        .catch(error => {
            console.error('Error during edit:', error);
            alert('编辑过程中发生错误');
        });
});