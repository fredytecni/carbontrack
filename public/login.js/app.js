window.addEventListener('DOMContentLoaded', () => {
    const ctx = document.getElementById('chart1');
    if(ctx){
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Alcance 1', 'Alcance 2', 'Alcance 3'],
                datasets: [{
                    label: 'Emisiones (tCO2e)',
                    data: [12, 19, 3],
                }]
            }
        });
    }
});