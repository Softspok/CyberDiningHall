fetch( `/analyze_customer_feature`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
}).then(response => response.json())
    .then(data => {
        // 显示返回的数据
        const featuresDiv = document.getElementById('features');

        // 显示订单分布
        const maleOrderDistribution = data[0];
        const femaleOrderDistribution = data[1];
        featuresDiv.innerHTML += `<h3>订单分布</h3>`;
        featuresDiv.innerHTML += `<h4>男性顾客</h4>`;
        for (const [merchant, count] of Object.entries(maleOrderDistribution)) {
            featuresDiv.innerHTML += `<p>${merchant}: ${count} 次</p>`;
        }
        featuresDiv.innerHTML += `<h4>女性顾客</h4>`;
        for (const [merchant, count] of Object.entries(femaleOrderDistribution)) {
            featuresDiv.innerHTML += `<p>${merchant}: ${count} 次</p>`;
        }

        // 显示评论习惯
        const commentHabits = data[2];
        featuresDiv.innerHTML += `<h3>评论习惯</h3>`;
        featuresDiv.innerHTML += `<p>男性顾客平均评分: ${commentHabits.male_comment_habit}</p>`;
        featuresDiv.innerHTML += `<p>男性顾客评论次数: ${commentHabits.male_comment_cnt}</p>`;
        featuresDiv.innerHTML += `<p>女性顾客平均评分: ${commentHabits.female_comment_habit}</p>`;
        featuresDiv.innerHTML += `<p>女性顾客评论次数: ${commentHabits.female_comment_cnt}</p>`;
    })
    .catch(error => {
        console.error('Error fetching customer features:', error);
    });