document.addEventListener("DOMContentLoaded", function() {
        const urlParams = new URLSearchParams(window.location.search);
        const account = urlParams.get('c-account');
        fetch('/customer_detailed', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ account: account })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error('Error:', data.error);
                alert('Error: ' + data.error);
            } else {
                const customer = data[0];
                document.getElementById('customer-name').textContent = customer.name;
                document.getElementById('customer-account').textContent = customer.account;
                document.getElementById('customer-gender').textContent = customer.gender;
                document.getElementById('customer-age').textContent = customer.age;
                document.getElementById('customer-hometown').textContent = customer.hometown;
                document.getElementById('customer-major').textContent = customer.major;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error: ' + error);
        });

    // 活跃度
    fetch('/get_customer_activity', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ account: account })
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error('Error:', data.error);
                alert('Error: ' + data.error);
            } else {
            // 设置热力图
                renderHeatmap(data);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error: ' + error);
        });
        });

function edit(){
    const urlParams = new URLSearchParams(window.location.search);
    const account = urlParams.get('c-account');
    if(account)
        window.location.href = `/edit_customer_information?c-account=${account}`;
    else
        window.location.href = `/index`;
}

function renderHeatmap(orders) {
    const parseDate = d3.timeParse("%a, %d %b %Y %H:%M:%S GMT");
    const parseDate_ = d3.timeParse("%Y-%m-%d");
    const formatDay = d3.timeFormat("%Y-%m-%d");

    // 日活跃度热力图
    const countsPerDay = d3.rollup(orders, v => v.length, d => formatDay(parseDate(d.time)));

    const startYear = new Date().getFullYear();
    let startDate = new Date(startYear, 0, 1); // 当年的1月1日
    if (startDate.getDay() !== 0) { // 如果不是星期日
        startDate.setDate(startDate.getDate() - startDate.getDay()); // 调整到前一个星期日
    }
    const dates = Array.from(countsPerDay.keys()).map(d => parseDate_(d));
    const extent = d3.extent(dates);
    const endDate = new Date(Math.max(new Date(), extent[1])); // 最晚不超过今天


    const dateCounts = new Map();
    let currentDate = new Date(startDate.getTime());
    while (currentDate <= endDate) {
        const formattedDate = formatDay(currentDate);
        dateCounts.set(formattedDate, countsPerDay.get(formattedDate) || 0);
        currentDate.setDate(currentDate.getDate() + 1);
    }

    const weeks = Math.ceil((endDate - startDate) / (7 * 24 * 60 * 60 * 1000));

    const margin = { top: 20, right: 20, bottom: 20, left: 20 };

    const maxCount = d3.max(Array.from(countsPerDay.values()));
    const colorScale = d3.scaleQuantize()
        .domain([0, maxCount])
        .range(["#fff7ec","#fee8c8","#fdd49e","#fdbb84","#fc8d59","#ef6548","#d7301f"]);

    const cellSize = 23;  // Cell size including padding
    const cellPadding = 3;

    const formattedData = Array.from(dateCounts.entries()).map(([date, count]) => ({
        date,
        count
    }));

    const svg = d3.select("#heatmap")
        .append("svg")
        .attr("width", weeks * cellSize + margin.left + margin.right)
        .attr("height", 7 * cellSize + margin.top + margin.bottom)
        .append("g")
        .attr("stroke", "#000000")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    svg.selectAll(".day")
        .data(formattedData)
        .enter().append("rect")
        .attr("class", "day")
        .attr("width", cellSize - cellPadding)
        .attr("height", cellSize - cellPadding)
        .attr("x", d => {
            const date = parseDate_(d.date);
            const diffTime = date - startDate;
            const diffDays = Math.floor(diffTime / (1000 * 3600 * 24));
            const weekIndex = Math.floor(diffDays / 7);
            return weekIndex * cellSize;
        })
        .attr("y", d => {
            const date = parseDate_(d.date);
            return date.getDay() * cellSize;
        })
        .attr("fill", d => colorScale(d.count))
        .attr("stroke", "#000000")
        .attr("rx", 2)
        .attr("ry", 2);

    svg.selectAll(".day")
        .on("mouseover", (event, d) => {
            document.getElementById('tooltip').innerHTML = `Date: ${d.date}, Count: ${d.count}`;
            document.getElementById('tooltip').style.display = 'block';
            document.getElementById('tooltip').style.left = (event.pageX + 10) + 'px';
            document.getElementById('tooltip').style.top = (event.pageY + 10) + 'px';
        })
        .on("mouseout", () => {
            document.getElementById('tooltip').style.display = 'none';
        });

    // 处理每周点餐频率变化趋势
    const weekFormat = d3.timeFormat("%Y-W%U");
    const weekCounts = d3.rollup(
        orders,
        v => v.length,
        d => weekFormat(parseDate(d.time))
    );
    const weekData = Array.from(weekCounts, ([week, count]) => ({ week, count }));

    const other_margin = { top: 20, right: 20, bottom: 30, left: 50 };
    const width = 800 - other_margin.left - other_margin.right;
    const height = 400 - other_margin.top - other_margin.bottom;

    const x = d3.scaleBand()
        .domain(weekData.map(d => d.week))
        .range([0, width])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(weekData, d => d.count)])
        .nice()
        .range([height, 0]);

    const svgWeek = d3.select("#weekly-trend").append("svg")
        .attr("width", width + other_margin.left + other_margin.right)
        .attr("height", height + other_margin.top + other_margin.bottom)
        .append("g")
        .attr("transform", `translate(${other_margin.left},${other_margin.top})`);

    svgWeek.append("g")
        .selectAll(".bar")
        .data(weekData)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.week))
        .attr("y", d => y(d.count))
        .attr("fill", "rgb(65,141,255)")
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.count));

    svgWeek.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    svgWeek.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(y));


    // 处理每月点餐频率变化趋势
    const monthFormat = d3.timeFormat("%Y-%m");
    const monthCounts = d3.rollup(
        orders,
        v => v.length,
        d => monthFormat(parseDate(d.time))
    );
    const monthData = Array.from(monthCounts, ([month, count]) => ({ month, count }));

    const xMonth = d3.scaleBand()
        .domain(monthData.map(d => d.month))
        .range([0, width])
        .padding(0.1);

    const yMonth = d3.scaleLinear()
        .domain([0, d3.max(monthData, d => d.count)])
        .nice()
        .range([height, 0]);

    const svgMonth = d3.select("#monthly-trend").append("svg")
        .attr("width", width + other_margin.left + other_margin.right)
        .attr("height", height + other_margin.top + other_margin.bottom)
        .append("g")
        .attr("transform", `translate(${other_margin.left},${other_margin.top})`);

    svgMonth.append("g")
        .selectAll(".bar")
        .data(monthData)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => xMonth(d.month))
        .attr("y", d => yMonth(d.count))
        .attr("fill", "rgb(65,141,255)")
        .attr("width", xMonth.bandwidth())
        .attr("height", d => height - yMonth(d.count));

    svgMonth.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xMonth));

    svgMonth.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(yMonth));


    // 处理每天各时间段的点餐数量
    const hourFormat = d3.timeFormat("%H");
    const dayHourCounts = d3.rollup(
        orders,
        v => v.length,
        d => hourFormat(parseDate(d.time))
    );
    const hourData = Array.from(dayHourCounts, ([hour, count]) => ({ hour: +hour, count })).sort((a, b) => a.hour - b.hour);
    const xHour = d3.scaleBand()
        .domain(hourData.map(d => d.hour))
        .range([0, width])
        .padding(0.1);

    const yHour = d3.scaleLinear()
        .domain([0, d3.max(hourData, d => d.count)])
        .nice()
        .range([height, 0]);

    const svgHour = d3.select("#hourly-trend").append("svg")
        .attr("width", width + other_margin.left + other_margin.right)
        .attr("height", height + other_margin.top + other_margin.bottom)
        .append("g")
        .attr("transform", `translate(${other_margin.left},${other_margin.top})`);

    svgHour.append("g")
        .selectAll(".bar")
        .data(hourData)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => xHour(d.hour))
        .attr("y", d => yHour(d.count))
        .attr("fill", "rgb(65,141,255)")
        .attr("width", xHour.bandwidth())
        .attr("height", d => height - yHour(d.count));

    svgHour.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xHour));

    svgHour.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(yHour));

}