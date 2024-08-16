document.addEventListener("DOMContentLoaded", function() {
    const urlParams = new URLSearchParams(window.location.search);
    const account = urlParams.get('m-account');
    fetch('/merchant_detailed', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ account: account })  // Replace with actual account
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error('Error:', data.error);
                alert('Error: ' + data.error);
            } else {
                const merchant = data[0];
                document.getElementById('merchant-account').textContent = merchant.account;
                document.getElementById('merchant-name').textContent = merchant.name;
                document.getElementById('merchant-introduction').textContent = merchant.introduction;
                document.getElementById('merchant-stars').textContent = merchant.stars;
                document.getElementById('merchant-collectedCnt').textContent = merchant.collectedCnt;
                document.getElementById('merchant-address').textContent = merchant.address;

                const pictures = merchant.pictures;
                const container = document.getElementById('merchant-pictures');
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
            console.error('Error:', error);
            alert('Error: ' + error);
        });
});

function edit(){
    const urlParams = new URLSearchParams(window.location.search);
    const account = urlParams.get('m-account');
    if(account)
        window.location.href = `/edit_merchant_information?m-account=${account}`;
    else
        window.location.href = `/index`;
}