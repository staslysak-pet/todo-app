// PACK ALL DATA TO MONGO DATABASE
function packData(note){

    const header = note.querySelector('.header').innerText;
    const type = note.getAttribute('data-type');
    const OBJ = {
        type,
        header
    }

    const time = new Date()
    const fulltime = time.toLocaleString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });

    if(type === 'note'){
        const noteText = note.querySelector('.noteText').innerText;

        return {
            ...OBJ,
            noteText,
            created: fulltime
        };
    }
    if(type === 'list'){
        const lists = note.querySelectorAll('.textEl');

        const unchecked = [];
        const checked = [];

        for(let i = 0; i < lists.length - 1; i++){ // - 1 for cutting off the last child cause it's the list elements creator
            if(lists[i].previousSibling.getAttribute('aria-checked') === 'true'){
                checked.push(lists[i].innerText);
            }else{
                unchecked.push(lists[i].innerText);
            }
        }

        return {
            ...OBJ,
            list: {
                unchecked,
                checked
            },
            created: fulltime
        };
    }
}

// GET ID REQUIRED FOR POST AND DELETE REQUEST
const getNoteId = note => note.getAttribute('data-id')

const API = {
    POST: async (dataEl) => {
        try{
            const data = await packData(dataEl);
            const fetchObj = {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: 'POST',
                body: JSON.stringify(data)
            }

            await fetch('/', fetchObj)
                .then(() => window.location.href = '/')
                .catch(err => console.log(err))
        }catch(err){
            console.error(err)
        }
    },
    PUT: async (dataEl) => {
        try{
            const data  = await packData(dataEl);
            const id    = await getNoteId(dataEl);
            const fetchObj = {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: 'PUT',
                body: JSON.stringify(data)
            }

            await fetch(`/${id}`, fetchObj)
                .then(() => window.location.href = '/')
                .catch(err => console.log(err))
        }catch(err){
            console.error(err)
        }
    },
    DELETE: async (dataEl) => {
        try{
            const id = await getNoteId(dataEl);

            await fetch(`/${id}`, { method: 'DELETE' })
                .then(() => window.location.href = '/')
                .catch(err => console.log(err))
        }catch(err){
            console.error(err)
        }
    }
};