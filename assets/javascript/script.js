const NOTE_IMAGE = "/To-Do/assets/images/page.png"; 
let currentNoteElement = null;
let selectedNote = null;
let selectedColor = "white";
let selectedImage = "page.png";
let maxZIndex = 1;

function selectColor(color, image, btn) {
    selectedColor = color;
    selectedImage = image;

    document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
    if (btn) {
        btn.classList.add('active');
    }
}

function openColorHelpModal() {
    document.getElementById('colorHelpModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeColorHelpModal() {
    document.getElementById('colorHelpModal').classList.remove('active');
    document.body.style.overflow = 'auto';
}

function openModalForNote(noteElement) {
    currentNoteElement = noteElement;
    document.getElementById("noteModal").classList.add("active");
    document.getElementById("noteText").value = '';
    document.getElementById("noteText").focus();

    selectedColor = 'white';
    selectedImage = 'page.png';
    document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
    const defaultBtn = document.querySelector('.color-btn[data-color="white"]');
    if (defaultBtn) defaultBtn.classList.add('active');
}

function closeModal() {
    document.getElementById("noteModal").classList.remove("active");
    if (currentNoteElement) {
        const textarea = currentNoteElement.querySelector("textarea");
        if (!textarea || !textarea.value.trim()) {
            currentNoteElement.remove();
            saveBoardState();
        }
    }

    currentNoteElement = null;
}

function createNoteFromModal() { 
    const text = document.getElementById("noteText").value.trim();
    
    if (!text) {
        alert("Напишите текст заметки!"); 
        return;
    }

    if (currentNoteElement) {
        const textarea = currentNoteElement.querySelector("textarea");
        if (textarea) {
            textarea.value = text;
            textarea.readOnly = true;
            textarea.style.display = "block";
        }
    }

    const img = currentNoteElement.querySelector("img");
    if (img) {
        img.src = `/To-Do/assets/images/${selectedImage}`;
    }

    const noteToKeep = currentNoteElement;
    currentNoteElement = null;

    closeModal();

    if (noteToKeep) {
        saveBoardState();
    }
}

function createEmptyNote(x, y) {
    const board = document.getElementById("board");
    
    const note = document.createElement("div");
    note.className = "note";
    
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    
    note.style.left = (x + scrollX) + "px";
    note.style.top = (y + scrollY) + "px";
    note.style.width = "200px";
    note.style.height = "200px";
    
    const currentImage = selectedImage || 'page.png';
    
    maxZIndex++;
    note.style.zIndex = maxZIndex;

    note.innerHTML = `
        <img src="/To-Do/assets/images/${currentImage}" alt="note paper" style="width:100%; height:100%; object-fit:fill;">
        <textarea readonly style="display: none;"></textarea>
        <div class="delete-note" onclick="event.stopPropagation(); this.parentElement.remove(); saveBoardState();">×</div>
        <div class="resize-handle" onmousedown="startResize(event, this.parentElement)"></div>
    `;
    
    board.appendChild(note);
    makeDraggable(note);
    
    note.ondblclick = function(e) {
        e.stopPropagation();
        editNote(this);
    };
    
    note.onclick = function(e) {
        if (!e.target.classList.contains("resize-handle") && 
            !e.target.classList.contains("delete-note")) {
            selectNote(this);
        }
    };
    
    openModalForNote(note);
    return note;
}

function startResize(event, note) {
    event.preventDefault();
    event.stopPropagation();
    
    note.classList.add("resizing");
    
    const startX = event.clientX;
    const startY = event.clientY;
    const startWidth = parseInt(window.getComputedStyle(note).width, 10);
    const startHeight = parseInt(window.getComputedStyle(note).height, 10);
    
    function onMouseMove(e) {
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        
        const newWidth = Math.max(100, startWidth + dx);
        const newHeight = Math.max(100, startHeight + dy);
        
        note.style.width = newWidth + "px";
        note.style.height = newHeight + "px";
    }
    
    function onMouseUp() {
        note.classList.remove("resizing");
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        saveBoardState();
    }
    
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
}

function makeDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    
    element.onmousedown = dragMouseDown;
    
    function dragMouseDown(e) {
        if (e.target.classList.contains("delete-note") || 
            e.target.classList.contains("resize-handle") ||
            e.target.tagName === "TEXTAREA") {
            return;
        }
        
        e.preventDefault();
        
        pos3 = e.clientX;
        pos4 = e.clientY;
        
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }
    
    function elementDrag(e) {
        e.preventDefault();
        
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        
        
        const newTop = element.offsetTop - pos2;
        const newLeft = element.offsetLeft - pos1;
        
        const board = document.getElementById("board");
        const maxTop = board.offsetHeight - element.offsetHeight;
        const maxLeft = board.offsetWidth - element.offsetWidth;
        
        const topMargin = Math.max(0, Math.min(maxTop, newTop));
        console.log(element.style.top.match(/\d+/g)[0], topMargin); // убрать
        if (topMargin > 50 && topMargin < window.innerHeight - 50 || +(element.style.top.match(/\d+/g)[0]) < topMargin) {
            element.style.top = Math.max(0, Math.min(maxTop, newTop)) + "px";
        }
        
        element.style.left = Math.max(0, Math.min(maxLeft, newLeft)) + "px";
    }
    
    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
        saveBoardState();
    }
}

function selectNote(note) {
    if (selectedNote) {
        selectedNote.classList.remove("selected");
    }
    selectedNote = note;
    selectedNote.classList.add("selected");

    maxZIndex++;
    selectedNote.style.zIndex = maxZIndex;
}

function editNote(note) {
    const textarea = note.querySelector("textarea");
    if (textarea) {
        textarea.readOnly = false;
        textarea.style.display = "block";
        textarea.focus();
        
        textarea.onblur = function() {
            this.readOnly = true;
            saveBoardState();
        };
        
        textarea.onkeydown = function(e) {
            if (e.key === "Enter" && !e.shiftKey) {
                this.blur();
            }
        };
    }
}

function saveBoardState() {
    const notes = [];
    document.querySelectorAll('.note').forEach(note => {
        const textarea = note.querySelector('textarea');
        const img = note.querySelector('img');
        let imageName = 'page.png';
        if (img) {
            const src = img.src;
            const parts = src.split('/');
            imageName = parts[parts.length - 1];
        }
        notes.push({
            text: textarea ? textarea.value : '',
            left: note.style.left,
            top: note.style.top,
            width: note.style.width,
            height: note.style.height,
            image: imageName  
        });
    });
    localStorage.setItem('boardNotes', JSON.stringify(notes));
}

function loadBoardState() {
    const saved = localStorage.getItem("boardNotes");
    if (saved) {
        const notes = JSON.parse(saved);
        notes.forEach(noteData => {
            if (!noteData.text) return;
            
            const note = document.createElement("div");
            note.className = "note";
            note.style.left = noteData.left;
            note.style.top = noteData.top;
            note.style.width = noteData.width || "200px";
            note.style.height = noteData.height || "200px";
            
            const imageName = noteData.image || 'page.png';
            
            note.innerHTML = `
                <img src="/To-Do/assets/images/${imageName}" alt="note paper" style="width:100%; height:100%; object-fit:fill;">
                <textarea readonly>${escapeHtml(noteData.text)}</textarea>
                <div class="delete-note" onclick="event.stopPropagation(); this.parentElement.remove(); saveBoardState();">×</div>
                <div class="resize-handle" onmousedown="startResize(event, this.parentElement)"></div>
            `;
            
            document.getElementById("board").appendChild(note);
            makeDraggable(note);
            
            note.ondblclick = function(e) {
                e.stopPropagation();
                editNote(this);
            };
            
            note.onclick = function(e) {
                if (!e.target.classList.contains("resize-handle") && 
                    !e.target.classList.contains("delete-note")) {
                    selectNote(this);
                }
            };
        });
    }
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

function openInfoModal() {
    document.getElementById("infoModal").classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeInfoModal() {
    document.getElementById("infoModal").classList.remove("active");
    document.body.style.overflow = "auto";
}

document.addEventListener("DOMContentLoaded", function() {
    console.log('Скрипт загружен!'); // убрать
    
    const board = document.getElementById("board");
    board.ondblclick = function(e) {
        createEmptyNote(e.clientX, e.clientY);
    };

    const modal = document.getElementById("noteModal");
    modal.onclick = function(e) {
        if (e.target === this) {
            closeModal();
        }
    };

    setTimeout(() => {
        const hint = document.getElementById("hint");
        if (hint) {
            hint.style.display = "none";
        }
    }, 5000);

    loadBoardState();

    const infoBtn = document.getElementById("infoBtn");
    if (infoBtn) {
        infoBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            openInfoModal();
        };
    }

    const infoModal = document.getElementById("infoModal");
    if (infoModal) {
        infoModal.onclick = function(e) {
            if (e.target === this) {
                closeInfoModal();
            }
        };
    }

    document.addEventListener("keydown", function(e) {
        if (e.key === "Escape") {
            if (document.getElementById("infoModal").classList.contains("active")) {
                closeInfoModal();
            }
            if (document.getElementById('noteModal').classList.contains("active")) {
                closeModal();
            }
        }
    });

    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.onclick = function(e) {
            e.stopPropagation();
            const color = this.dataset.color;
            const image = this.dataset.image;
            selectColor(color, image, this);
        };
    });

    const colorHelpBtn = document.getElementById('colorHelpBtn');
    if (colorHelpBtn) {
        colorHelpBtn.onclick = function(e) {
            e.stopPropagation();
            openColorHelpModal();
        };
    }

    const colorHelpModal = document.getElementById('colorHelpModal');
    if (colorHelpModal) {
        colorHelpModal.onclick = function(e) {
            if (e.target === this) {
                closeColorHelpModal();
            }
        };
    }

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (document.getElementById('colorHelpModal').classList.contains('active')) {
                closeColorHelpModal();
            }
            if (document.getElementById('infoModal').classList.contains('active')) {
                closeInfoModal();
            }
            if (document.getElementById('noteModal').classList.contains('active')) {
                closeModal();
            }
        }
    });
});