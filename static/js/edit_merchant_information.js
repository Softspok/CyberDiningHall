document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const account = urlParams.get('m-account');
    const form = document.getElementById('merchantForm');

    form.addEventListener('submit', async function(event) {
        event.preventDefault(); // 阻止表单默认提交行为
        try {
            await uploadImages(); // 等待图片上传完成
            await submitForm(); // 然后提交表单信息
            alert('商户信息更新成功！');
            window.location.href = `/merchant_profile?m-account=${account}`; // 更新成功后跳转
        } catch (error) {
            console.error('Error during form submission:', error);
            alert('提交过程中发生错误');
        }
    });

    async function uploadImages() {
        const files = document.getElementById('imageUpload').files;
        if (files.length === 0) {
            return; // 如果没有文件被选择，直接返回
        }
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('files', files[i]);
        }
        formData.append('folder', 'merchant');

        const response = await fetch('/save_picture', {
            method: 'POST',
            body: formData
        });
        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }
        const path = await response.text();
        document.getElementById('picturesInput').value = path;
    }

    async function submitForm() {
        const formData = new FormData(form);
        const data = {
            account: account,
            name: formData.get('name') || null,
            password: formData.get('password') || null,
            introduction: formData.get('introduction') || null,
            address: formData.get('address') || null,
            pictures: formData.get('pictures') || null
        };

        const response = await fetch('/edit_merchant_information', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }
        return response.text(); // 这里仅返回处理结果，不做页面跳转
    }
});
