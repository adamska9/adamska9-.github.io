const inpName = document.getElementById('inpName');
const form = document.getElementById("player_name");

form.onclick = () => {
    if (inpName.value)
        localStorage.setItem('username', inpName.value);
}