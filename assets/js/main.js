class Note {
    constructor (obj){
        this.mainEl = obj.mainEl;
        this.header = obj.header;
        this.TNBs = obj.textNoteBodies;
        this.LNBs = obj.listNoteBodies;
    }

    changeContenteditableDefaults (evt){

        if(!evt.target.lastChild || evt.target.lastChild.nodeName.toLowerCase() != 'br'){
            evt.target.appendChild(document.createElement('br'));
        }

        if (evt.keyCode === 13) {
            evt.preventDefault();
            const sel = window.getSelection();
            const range = sel.getRangeAt(0);
            const br = document.createElement('br');

            range.deleteContents();
            range.insertNode(br);
            range.setStartAfter(br);
            range.setEndAfter(br);
            range.collapse(false);

            sel.removeAllRanges();
            sel.addRange(range);
            return false;
        }
    }

    newLineProhibition (evt){
        if(evt.keyCode === 13){
            evt.preventDefault()
        }
    }

    emptyHTML(...els){ els.forEach(el => el.innerHTML = '') }

    checkListElement (target){
        if(target.hasAttribute('aria-checked')){
            const isCheked = (target.getAttribute('aria-checked') === 'false') ? true : false;
            target.setAttribute('aria-checked', isCheked)
        }
    }

    createListElement (evt){
        const { ctrlKey, metaKey, altKey, keyCode } = evt
        if(!ctrlKey && !metaKey && !altKey && keyCode !== 13 && keyCode !== 9 && keyCode !== 27){

            const { target } = evt;

            const clone = target.parentNode.cloneNode(true);

            target.parentNode.removeAttribute('role');
            target.previousSibling.setAttribute('aria-checked', false);
            target.nextSibling.setAttribute('data-role', 'delete')
            target.removeAttribute('placeholder');
            target.removeAttribute('data-role')
            target.setAttribute('aria-label', 'list_body');

            target.parentNode.parentNode.appendChild(clone);
        }else{
            evt.preventDefault();
        }
    }

    deleteListElement (target){ target.remove() }

    init (selector){

        document.querySelectorAll(selector).forEach(el => {
            el.addEventListener('keydown', (evt) => {
                const { target } = evt

                if(target.getAttribute('data-role') === 'header'){
                    this.newLineProhibition(evt)
                }
                if(target.getAttribute('data-role') === 'text_note_body'){
                    this.changeContenteditableDefaults(evt)
                }
                if(target.getAttribute('data-role') === 'create_todo'){
                    this.createListElement(evt)
                }
                if(target.getAttribute('aria-label') === 'list_body'){
                    this.newLineProhibition(evt)
                }
            });
        });

        document.querySelectorAll(selector).forEach(el => {
            el.addEventListener('click', evt => {
                const { target } = evt
                if(target.hasAttribute('aria-checked')){
                    this.checkListElement(target)
                }

                if(target.dataset.role === 'delete'){
                    this.deleteListElement(target.parentNode)
                }
            });
         })

    }
}


class NoteCreator extends Note{
    constructor (obj){
        super(obj)
        this.creator = document.querySelector(obj.mainEl)
        this.creatorHeader = this.creator.querySelector(obj.header)
        this.creatorListsContainer = this.creator.querySelector(obj.creatorListsContainer)
        this.createListNoteButton = this.creator.querySelector(obj.createListNoteButton)
        this.createTextNoteButton = this.creator.querySelector(obj.createTextNoteButton)
        this.creatorControls = this.creator.querySelector(obj.creatorControls)
    }

    emptyCreatorListsContainer(){
        if(this.creatorListsContainer.children.length > 1){
            while(this.creatorListsContainer.children.length > 1){
                this.creatorListsContainer.removeChild(this.creatorListsContainer.firstChild)
            }
        }
    }

    resetNoteCreator (){
        this.emptyCreatorListsContainer();
        this.creator.removeAttribute('data-type');
        super.emptyHTML(this.createTextNoteButton, this.creatorHeader);
    }

    openTextNoteMode (){ this.creator.setAttribute('data-type', 'note') }
    openListNoteMode (){ this.creator.setAttribute('data-type', 'list') }

    POST_REQUEST (data_note){
        API.POST(data_note)
    }

    init (){
        super.init(this.mainEl)
        this.createTextNoteButton.addEventListener('click', this.openTextNoteMode.bind(this))
        this.createListNoteButton.addEventListener('click', this.openListNoteMode.bind(this))

        const reactOnKeyDownEvents = (evt, callback) => {
            if(evt.keyCode === 13 && !this.creator.hasAttribute('data-type')){
                evt.preventDefault()
                callback()
            }
        }
        this.createTextNoteButton.addEventListener('keydown', (evt) => {
            reactOnKeyDownEvents(evt, this.openTextNoteMode.bind(this))
        });
        this.createListNoteButton.addEventListener('keydown', (evt) => {
            reactOnKeyDownEvents(evt, this.openListNoteMode.bind(this))
            this.creator.querySelector('.textEl').focus()
        });
        this.creator.addEventListener('keydown', (evt) => {
            if(evt.keyCode === 27){
                this.resetNoteCreator()
            }
        });

        // click evetnt
        this.creator.addEventListener('click', evt => {
            const { target, currentTarget } = evt
            if(target.dataset.role === 'reset'){
                this.resetNoteCreator()
            }

            if(target.dataset.role === 'POST_REQUEST'){
                this.POST_REQUEST(currentTarget)
            }
        });
    }
}

class CreatedNote extends Note{
    constructor (obj){
        super(obj)
        this.mainEl = obj.mainEl
    }

    backDropOpening (){

        if(document.querySelector('.backdrop')) return

        const sel = document.createElement('div');
        setTimeout(() => {
            sel.classList.add('backdrop')
            sel.addEventListener('click', evt => {
                evt.currentTarget.remove();
                this.closeCreatedNote()
            });
        }, 0);

        document.body.append(sel)

    }

    openCreatedNote (evt){
        const cl = evt.target.classList
        if(!(cl.contains('toolbarBtn') || cl.contains('defaultBtn'))){ // classes of elements not to be clicked when note preview mode [data-state='close]
            this.backDropOpening()
            // const close  = document.querySelector(".note[data-state='close']")
            if(evt.currentTarget){
                evt.currentTarget.dataset.state = 'open'
            }
        }
    }

    closeCreatedNote (){
        if(document.querySelector('.backdrop')){
            document.querySelector('.backdrop').remove()
        }
        const open = document.querySelector(".note[data-state='open']")
        if(open){
            open.dataset.state = 'close'
        }
    }

    toggleCreatedNoteStatus (evt){ // change data-state attribute by keyCodes
        if(evt.keyCode === 13) this.openCreatedNote(evt)
        if(evt.keyCode === 27) this.closeCreatedNote()
    }

    PUT_REQUEST (note){
        API.PUT(note)
    }
    DELETE_REQUEST (note){
        API.DELETE(note)
    }

    init (){
        super.init(this.mainEl)

        const NOTES = document.querySelectorAll(this.mainEl)
        NOTES.forEach(note => note.addEventListener('click', (evt) => this.openCreatedNote.call(this, evt)))
        NOTES.forEach(note => note.addEventListener('keyup', this.toggleCreatedNoteStatus.bind(this)))

        NOTES.forEach(note => note.addEventListener('click', (evt) => {
            const { target, currentTarget } = evt;

            if(target.dataset.role === 'PUT_REQUEST'){
                this.PUT_REQUEST(currentTarget)
            }

            if(target.dataset.role === 'DELETE_REQUEST'){
                this.DELETE_REQUEST(currentTarget)
            }
        }))
    }

}

const createdNote = new CreatedNote({
    mainEl: '.mini',
    header: '.header',
    textNoteBodies: '.noteText',
    listNoteBodies: 'textEl'
})
createdNote.init()

const noteCreator = new NoteCreator({
    mainEl: '#creator',
    header: '.createHeader',
    textNoteBodies: '.noteText',
    listNoteBodies: '.textEl',
    creatorListsContainer: '#list',
    createTextNoteButton: '.createTextNote',
    createListNoteButton: '.createListNote',
    creatorControls: '#controls'
})
noteCreator.init()