function MySimpleModal(id, htmlContent) {
    this.htmlElementId = id;
    this.content = htmlContent;
    this.created = false;
}

MySimpleModal.prototype.open = function () {
    if(this.created){
        document.getElementById(this.htmlElementId).style.display='block';
    }else{
        print('Create the modal before operate it');
    }
};

MySimpleModal.prototype.close = function () {
    if(this.created){
        document.getElementById(this.htmlElementId).style.display='none';
    }else{
        print('Create the modal before operate it');
    }
};

MySimpleModal.prototype.create = function () {
    var modalHtml = '' +
        '<div id="'+this.htmlElementId+'" class="w3-modal">' +
            '<div class="w3-modal-content">' +
                '<div class="w3-container">' +
                    '<span onclick="closeModal(\''+this.htmlElementId+'\')" class="w3-button w3-display-topright">&times;</span>' +
                    this.content +
                '</div>' +
            '</div>' +
        '</div>';
    document.getElementById("modals").innerHTML += modalHtml;
    this.created = true;
    return this;
};



function openModal(id){
    document.getElementById(id).style.display='block'
}

function closeModal(id) {
    document.getElementById(id).style.display='none';
}

