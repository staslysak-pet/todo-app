(function(){
    const darkMode   = document.getElementById('dark_mode');
    const switchMode = document.getElementById('switchMode');

    if(localStorage.mode  == 'dark'){
        darkMode.disabled = false
    }else{
        darkMode.disabled = true
    }

    switchMode.onclick = function(){
        if(darkMode.disabled){
            localStorage.setItem('mode', 'dark')
            darkMode.disabled = false
        }else{
            localStorage.setItem('mode', 'light')
            darkMode.disabled = true;
        }
    }
})();