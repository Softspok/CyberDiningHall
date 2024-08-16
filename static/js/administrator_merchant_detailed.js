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
            window.location.href = `/manage_menu?c-account=${customer_account}&m-account=${merchant_account}`;
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

});
