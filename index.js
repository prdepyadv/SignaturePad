$(window).on("unload", function(e) {
    $('#otp').val('');
    $('#card_country_code').val('');
    $('#card_state_id').val('');
    $('#imageLoader-error').text('').hide();
    $('#clear').click();
});

$(document).ready(() => {
    $('.submit-button').attr('disabled', true);
    $('#clear').click();
})
let error = false, fitImage= true, signedAtText = 'Digitally signed on: [timestamp will come here]', loaderData =
    {bgColor: '#000',bgOpacity: '0.5',fontColor: '#fff',title: 'Processing. Please DO NOT refresh the page.'};
let canvas = document.getElementById('signature-pad');
let signaturePad = new SignaturePad(canvas, {
    backgroundColor: '#ffffff' // necessary for saving image as JPEG; can be removed is only saving as PNG or SVG
});
let ctx = canvas.getContext('2d');
let clientName = 'John Doe';
let isSignatureTextSet=0;
function resizeCanvas() {
    canvas.style.width ='100%';
    canvas.width  = canvas.offsetWidth;
    $('.upload-image-button').attr('title', 'Signature image should not be more than '+canvas.width+' x '+canvas.height+'.');
    $('#clear').click();
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();
document.getElementById('clear').addEventListener('click', function () {
    isSignatureTextSet=0;
    signaturePad.clear();
    $('#imageLoader').val('');
    $('#imageLoader-error').text('').hide();
    addTimeStamp();
});
document.getElementById('draw').addEventListener('click', function () {
    ctx.globalCompositeOperation = 'source-over'; // default value
});

document.getElementById('erase').addEventListener('click', function () {
    ctx.globalCompositeOperation = 'destination-out';
});

let imageLoader = document.getElementById('imageLoader');
imageLoader.addEventListener('change', handleImage, false);
function handleImage(){
    let reader, newImage, imageFile, ext;
    $('#imageLoader-error').text('').hide();
    imageFile = document.getElementById("imageLoader");
    newImage = $('#imageLoader').val();
    if(!newImage || !imageFile.files.length){
        return false;
    }
    ext = newImage.split('.').pop().toLowerCase()
    if($.inArray(ext.toLowerCase(), ['png','jpg','jpeg']) === -1) {
        $('#imageLoader-error').text('Only files with the following extensions are allowed: png jpg jpeg').show();
        setTimeout(() => {
            $('#imageLoader-error').text('').hide();
        }, 10000);
        $('#imageLoader').val('');
        return false;
    }

    reader = new FileReader();
    reader.onload = function(event){
        let img = new Image();
        img.onload = function(){
            fitImage = !fitImage;
            signaturePad.clear();
            if(fitImage){
                ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
            } else {
                ctx.drawImage(img,0,0);
            }
            isSignatureTextSet=1;
            addTimeStamp();
        }
        img.src = event.target.result;
    }
    reader.readAsDataURL(imageFile.files[0]);
}
$('#create-sign-dialog').on('show.bs.modal', function (e) {
    createSign();
});
function createSign(){
    let fontSize= 25, fontFace = $('#sign-font').val();
    if(!fontFace){
        return false;
    }
    $('#signature-example-text').css('font-family', fontFace);
    setTimeout(function () {
        $('#clear').click();$('#draw').click();
        ctx.fillStyle = 'rgb(0,0,0)';
        do{
            fontSize--;
            ctx.font= fontSize+"px "+fontFace;
        } while(ctx.measureText(clientName).width>canvas.width)
        ctx.fillText(clientName , (canvas.width/2) - (ctx.measureText(clientName).width / 2), canvas.height/2);
        addTimeStamp();
        isSignatureTextSet=1;
    }, 300);
    return true;
}

function addTimeStamp(time = false){
    let signedAt, today, fontFace="Helvetica", fontSize=16;
    today = new Date();
    signedAt = String(today.getMonth()+1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0')
        + '-' + today.getFullYear() + ' ' + String(today.getHours()).padStart(2, '0') +
        ':' + String(today.getMinutes()).padStart(2, '0')
        + ':' + String(today.getSeconds()).padStart(2, '0') +
        ' ' + Intl.DateTimeFormat().resolvedOptions().timeZone;
    ctx.fillStyle = 'white';
    ctx.fillRect((canvas.width/2) - (ctx.measureText(signedAtText).width/2), canvas.height - 30,
        ctx.measureText(signedAtText).width, ctx.measureText('M').width + 10);
    ctx.fillStyle = 'rgb(0,0,0)';
    if(time){
        signedAtText = 'Digitally signed on: ' + signedAt;
    } else {
        signedAtText = 'Digitally signed on: [timestamp will come here]';
    }
    do{
        fontSize--;
        ctx.font= fontSize+"px "+fontFace;
    } while(ctx.measureText(signedAtText).width>canvas.width)
    ctx.fillText(signedAtText, (canvas.width/2) - (ctx.measureText(signedAtText).width / 2), canvas.height - 15);
    $('#signature_data').val(signaturePad.toDataURL('image/jpeg'));$('#signed_at').val(signedAtText);
    signaturePad.toDataURL();
}

function submitForm(){
    setTimeout(function () {
        let formData, signatureUrl, timeNow;
        if (signaturePad.isEmpty() && !isSignatureTextSet) {
            $('#imageLoader-error').text('Signature is required.').show();
            setTimeout(() => {
                $('#imageLoader-error').text('').hide();
            }, 10000);
        }
        addTimeStamp(1);
    }, 300);
}