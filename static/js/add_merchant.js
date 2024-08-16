document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signupForm');
    const errorMessage = document.getElementById('error-message');

    signupForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const account = document.getElementById('account').value.trim();
        const name = document.getElementById('name').value.trim();
        const password = document.getElementById('password').value;
        const introduction = document.getElementById('introduction').value.trim();
        const pictures = document.getElementById('pictures').value.trim();
        const address = document.getElementById('address').value.trim();

        fetch('/signup_merchant_handler', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                account: account,
                name: name,
                password: password,
                introduction: introduction,
                pictures: pictures,
                address: address,
            }),
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Failed to create merchant');
            }
        })
        .then(data => {
            alert(`Merchant ${data.account} created successfully!`);
        })
        .catch(error => {
            console.error('Error:', error);
            errorMessage.textContent = 'Failed to create merchant. Please try again.';
        });
    });
});
