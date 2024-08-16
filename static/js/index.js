document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const tipParagraph = document.querySelector('.tip');

    loginForm.addEventListener('submit', function(event) {
        event.preventDefault(); // 阻止表单默认提交行为

        // 收集用户输入的数据
        const loginData = {
            account: usernameInput.value,
            password: passwordInput.value,
            type: document.querySelector('input[name="role"]:checked').value
        };

        // 发送 POST 请求到服务器
        fetch('/login_handler', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        })
            .then(response => response.json()) // 解析 JSON 响应
            .then(data => {
                if (data.error) {
                    tipParagraph.classList.add('error')
                    tipParagraph.style.display = 'block'; // 显示错误提示
                    tipParagraph.textContent = data.error;
                } else {
                    switch(loginData.type){
                        case 'customer':
                            window.location.href = `/customer_homepage?c-account=${data.account}`;
                            break;
                        case 'merchant':
                            window.location.href = `/merchant_homepage?m-account=${data.account}`;
                            break;
                        case 'administrator':
                            window.location.href = `/administrator_homepage?a-account=${data.account}`;
                            break;
                    }
                }
            })
            .catch(error => {
                console.error('Error:', error);
                tipParagraph.style.display = 'block'; // 显示错误提示
                tipParagraph.textContent = '登录请求失败';
            });
    });
});
