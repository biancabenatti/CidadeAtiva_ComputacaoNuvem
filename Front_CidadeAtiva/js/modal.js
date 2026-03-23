const modal = document.getElementById('editModal');
const closeBtn = document.querySelector('.close');
const editButtons = document.querySelectorAll('.btn-icon.edit');
const editTitle = document.getElementById('editTitle');
const editLocation = document.getElementById('editLocation');
const editDescription = document.getElementById('editDescription');

editButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        const card = e.target.closest('.card');
        editTitle.value = card.querySelector('strong').textContent;
        editLocation.value = card.querySelector('.text-data').textContent;
        editDescription.value = card.querySelector('.text-description').textContent;
        modal.style.display = 'block';
    });
});

closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if(e.target === modal) modal.style.display = 'none';
});

document.getElementById('editForm').addEventListener('submit', (e) => {
    e.preventDefault();
    // Aqui enviar os dados para o backend
    modal.style.display = 'none';
});