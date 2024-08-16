document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signupForm');
    const errorMessage = document.getElementById('error-message');

    signupForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const account = document.getElementById('account').value.trim();
        const name = document.getElementById('name').value.trim();
        const password = document.getElementById('password').value;
        const gender = document.getElementById('gender').value;
        const age = parseInt(document.getElementById('age').value);
        const hometown = document.getElementById('hometown').value.trim();
        const major = document.getElementById('major').value.trim();

        fetch('/signup_customer_handler', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                account: account,
                name: name,
                password: password,
                gender: gender,
                age: age,
                hometown: hometown,
                major: major,
            }),
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Failed to create customer');
            }
        })
        .then(data => {
            alert(`Customer ${data.account} created successfully!`);
        })
        .catch(error => {
            console.error('Error:', error);
            errorMessage.textContent = 'Failed to create customer. Please try again.';
        });
    });
});
