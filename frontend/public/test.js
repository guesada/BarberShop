console.log('Test script loaded successfully!');
document.addEventListener('DOMContentLoaded', function() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div style="padding: 20px; text-align: center;">
            <h1>BarberShop</h1>
            <p>If you can see this, the JavaScript is working!</p>
            <button onclick="alert('Button clicked!')">Click me</button>
        </div>
    `;
});
