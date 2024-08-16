document.querySelectorAll('input[name="role"]').forEach(radio => {
    radio.addEventListener('change', function() {
        if (this.value === 'customer') {
            document.getElementById('customerForm').classList.add('active');
            document.getElementById('merchantForm').classList.remove('active');
        } else {
            document.getElementById('customerForm').classList.remove('active');
            document.getElementById('merchantForm').classList.add('active');
        }
    });
});

document.querySelectorAll('.form').forEach(form => {
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        const formData = new FormData(this);
        const data = {};
        formData.forEach((value, key) => {
            // 将所有空字符串转换为 null
            data[key] = value === '' ? null : value;
        });

        fetch(this.id === 'customerForm' ? '/signup_customer_handler' : '/signup_merchant_handler', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(data => {
                        throw new Error(data.error || '注册请求失败');
                    });
                }
                return response.json();
            })
            .then(data => {
                const messageElement = document.getElementById('message');
                messageElement.textContent = '注册成功! 页面将在 5 秒后跳转...';

                let seconds = 5; // 开始的秒数
                const countdown = setInterval(() => {
                    seconds--; // 每次回调减少1秒
                    if (seconds > 0) {
                        messageElement.textContent = `注册成功! 页面将在 ${seconds} 秒后跳转...`;
                    } else {
                        clearInterval(countdown); // 停止倒计时
                        window.location.href = '/'; // 时间结束后跳转到根页面
                    }
                }, 1000); // 每1000毫秒调用一次，即1秒
            })
            .catch(error => {
                console.error('Error:', error);
                document.getElementById('message').textContent = error;
            });
    });
});
