
fetch("/nav.html")
    .then(response => response.text())
    .then(data => {
        document.querySelector('[data-component="nav"]').innerHTML = data;
    })
    .catch(error => {
        console.error('Error loading navigation:', error);
    });