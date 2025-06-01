const video = document.getElementById( 'videoElement' );
const canvas = document.getElementById( 'canvasElement' );
const captureButton = document.getElementById( 'captureButton' );
const switchCameraButton = document.getElementById( 'switchCameraButton' );
const mirrorToggleButton = document.getElementById( 'mirrorToggleButton' );
const resetButton = document.getElementById( 'resetButton' );
const downloadButton = document.getElementById( 'downloadButton' );
const layoutSelector = document.getElementById( 'layoutSelector' );
const photoLayoutAreaContainer = document.getElementById( 'photoLayoutAreaContainer' );
const photoLayoutArea = document.getElementById( 'photoLayoutArea' );
const stickerPreviewOverlay = document.getElementById( 'stickerPreviewOverlay' );
const textPreviewOverlay = document.getElementById( 'textPreviewOverlay' );
const messageBox = document.getElementById( 'messageBox' );

const editingControlsPanel = document.getElementById( 'editingControlsPanel' );
const bgColorPicker = document.getElementById( 'bgColorPicker' );
const brightnessSlider = document.getElementById( 'brightnessSlider' );
const brightnessValueSpan = document.getElementById( 'brightnessValue' );
const contrastSlider = document.getElementById( 'contrastSlider' );
const contrastValueSpan = document.getElementById( 'contrastValue' );
const grayscaleToggle = document.getElementById( 'grayscaleToggle' );

const stickerAddButtons = document.querySelectorAll( '.sticker-add-btn' );
const removeLastStickerButton = document.getElementById( 'removeLastStickerButton' );

const textTemplateCategorySelector = document.getElementById( 'textTemplateCategorySelector' );
const textTemplateSelector = document.getElementById( 'textTemplateSelector' );
const textInput = document.getElementById( 'textInput' );
const textPositionSelector = document.getElementById( 'textPositionSelector' );
const fontFamilySelector = document.getElementById( 'fontFamilySelector' );
const fontSizeInput = document.getElementById( 'fontSizeInput' );
const fontColorPicker = document.getElementById( 'fontColorPicker' );
const textBoldToggle = document.getElementById( 'textBoldToggle' );
const addTextButton = document.getElementById( 'addTextButton' );
const removeLastTextButton = document.getElementById( 'removeLastTextButton' );


let currentStream;
let currentFacingMode = 'user';
let isMirrorMode = true;
let capturedPhotosData = [];
let currentPhotoCount = 0;
const DOWNLOAD_DPI = 300;
const CANVAS_MARGIN_CM = 0.5;

let editBrightness = 100;
let editContrast = 100;
let editGrayscale = false;
let addedStickers = [];
let nextStickerId = 0;
let addedTexts = [];
let nextTextId = 0;


const stickerPreviewPositions = {
    heart: [ { top: '10%', left: '80%' }, { top: '75%', left: '15%' }, { top: '5%', left: '5%' }, { top: '20%', left: '20%' }, { top: '60%', left: '70%' } ],
    star: [ { top: '15%', left: '10%' }, { top: '80%', left: '85%' }, { top: '45%', left: '45%' }, { top: '80%', left: '30%' }, { top: '25%', left: '75%' } ],
    pentol: [ { top: '50%', left: '50%' }, { top: '20%', left: '60%' }, { top: '70%', left: '30%' }, { top: '30%', left: '80%' }, { top: '85%', left: '5%' } ],
};

const templateTexts = {
    romantis: [
        "Cintaku padamu sedalam samudra.",
        "Kamu adalah bintang di malamku.",
        "Setiap detik bersamamu adalah surga.",
        "Hatiku hanya untukmu.",
        "Kaulah nafasku."
    ],
    pertemanan: [
        "Sahabat sejati takkan terganti.",
        "Teman adalah keluarga yang kita pilih.",
        "Bersama teman, semua jadi ringan.",
        "Terima kasih sudah jadi temanku.",
        "Kenangan indah bersama kalian."
    ],
    persahabatan: [
        "Persahabatan itu abadi.",
        "Kalian adalah kekuatanku.",
        "Selalu ada untuk satu sama lain.",
        "Sahabat sejati, cerita tanpa akhir.",
        "Tertawa bersama, menangis bersama."
    ]
};


function cmToPx ( cm, dpi = DOWNLOAD_DPI )
{
    return ( cm / 2.54 ) * dpi;
}
function ptToPxPreview ( pt )
{
    return parseFloat( pt ) * 1.33;
}
function ptToPxDownload ( pt, dpi = DOWNLOAD_DPI )
{
    return ( parseFloat( pt ) / 72 ) * dpi;
}


const basePolaroidPaddingCm = { top: 0.4, right: 0.4, bottom: 1.5, left: 0.4 };
const baseGapCm = 0.3;

const layoutConfigs = {
            'polaroid_2c2r_photo_horz': { slots: 4, name: "Polaroid 2x2 - Foto Horz (7.5x5cm)", cols: 2, rows: 2, photoContentCm: { w: 7.5, h: 5 }, polaroid: true, polaroidPaddingCm: { ...basePolaroidPaddingCm }, gapCm: baseGapCm },
            'polaroid_2c2r_photo_vert': { slots: 4, name: "Polaroid 2x2 - Foto Vert (5x7.5cm)", cols: 2, rows: 2, photoContentCm: { w: 5, h: 7.5 }, polaroid: true, polaroidPaddingCm: { ...basePolaroidPaddingCm }, gapCm: baseGapCm },
            'polaroid_3c2r_photo_sq': { slots: 6, name: "Polaroid 3x2 - Foto Kotak (5x5cm)", cols: 3, rows: 2, photoContentCm: { w: 5, h: 5 }, polaroid: true, polaroidPaddingCm: { ...basePolaroidPaddingCm }, gapCm: baseGapCm },
            'polaroid_2c3r_photo_sq': { slots: 6, name: "Polaroid 2x3 - Foto Kotak (5x5cm)", cols: 2, rows: 3, photoContentCm: { w: 5, h: 5 }, polaroid: true, polaroidPaddingCm: { ...basePolaroidPaddingCm }, gapCm: baseGapCm },
            'polaroid_4c2r_photo_vert': { slots: 8, name: "Polaroid 4x2 - Foto Vert (3.75x5cm)", cols: 4, rows: 2, photoContentCm: { w: 3.75, h: 5 }, polaroid: true, polaroidPaddingCm: { ...basePolaroidPaddingCm }, gapCm: baseGapCm * 0.8 },
            'polaroid_2c4r_photo_vert': { slots: 8, name: "Polaroid 2x4 - Foto Vert (3.75x5cm)", cols: 2, rows: 4, photoContentCm: { w: 3.75, h: 5 }, polaroid: true, polaroidPaddingCm: { ...basePolaroidPaddingCm }, gapCm: baseGapCm * 0.8 },
            'polaroid_5c2r_photo_horz': { slots: 10, name: "Polaroid 5x2 - Foto Horz (6.5x3.9cm)", cols: 5, rows: 2, photoContentCm: { w: 6.5, h: 3.9 }, polaroid: true, polaroidPaddingCm: { top: 0.4, right: 0.4, bottom: 2.0, left: 0.4 }, gapCm: baseGapCm * 0.7 },
            'polaroid_5c2r_photo_vert': { slots: 10, name: "Polaroid 5x2 - Foto Vert (3.9x7.0cm)", cols: 5, rows: 2, photoContentCm: { w: 3.9, h: 7.0 }, polaroid: true, polaroidPaddingCm: { top: 0.4, right: 0.4, bottom: 2.0, left: 0.4 }, gapCm: baseGapCm * 0.7 }, // Tinggi foto diperbarui
            'polaroid_2c5r_photo_horz': { slots: 10, name: "Polaroid 2x5 - Foto Horz (6.5x3.9cm)", cols: 2, rows: 5, photoContentCm: { w: 6.5, h: 3.9 }, polaroid: true, polaroidPaddingCm: { top: 0.4, right: 0.4, bottom: 2.0, left: 0.4 }, gapCm: baseGapCm * 0.7 },
            'polaroid_2c5r_photo_vert': { slots: 10, name: "Polaroid 2x5 - Foto Vert (3.9x7.0cm)", cols: 2, rows: 5, photoContentCm: { w: 3.9, h: 7.0 }, polaroid: true, polaroidPaddingCm: { top: 0.4, right: 0.4, bottom: 2.0, left: 0.4 }, gapCm: baseGapCm * 0.7 }, // Tinggi foto diperbarui
            'grid_2c2r_photo_horz': { slots: 4, name: "Grid Saja 2x2 - Foto Horz (7.5x5cm)", cols: 2, rows: 2, photoContentCm: { w: 7.5, h: 5 }, polaroid: false, gapCm: baseGapCm },
            'grid_2c2r_photo_vert': { slots: 4, name: "Grid Saja 2x2 - Foto Vert (5x7.5cm)", cols: 2, rows: 2, photoContentCm: { w: 5, h: 7.5 }, polaroid: false, gapCm: baseGapCm },
            'grid_3c2r_photo_sq': { slots: 6, name: "Grid Saja 3x2 - Foto Kotak (5x5cm)", cols: 3, rows: 2, photoContentCm: { w: 5, h: 5 }, polaroid: false, gapCm: baseGapCm },
            'grid_2c3r_photo_sq': { slots: 6, name: "Grid Saja 2x3 - Foto Kotak (5x5cm)", cols: 2, rows: 3, photoContentCm: { w: 5, h: 5 }, polaroid: false, gapCm: baseGapCm },
            'grid_4c2r_photo_vert': { slots: 8, name: "Grid Saja 4x2 - Foto Vert (3.75x5cm)", cols: 4, rows: 2, photoContentCm: { w: 3.75, h: 5 }, polaroid: false, gapCm: baseGapCm * 0.8 },
            'grid_2c4r_photo_vert': { slots: 8, name: "Grid Saja 2x4 - Foto Vert (3.75x5cm)", cols: 2, rows: 4, photoContentCm: { w: 3.75, h: 5 }, polaroid: false, gapCm: baseGapCm * 0.8 },
            'grid_5c2r_photo_horz': { slots: 10, name: "Grid Saja 5x2 - Foto Horz (5.5x3.3cm)", cols: 5, rows: 2, photoContentCm: { w: 5.5, h: 3.3 }, polaroid: false, gapCm: baseGapCm * 0.7 },
            'grid_5c2r_photo_vert': { slots: 10, name: "Grid Saja 5x2 - Foto Vert (3.3x5.5cm)", cols: 2, rows: 5, photoContentCm: { w: 3.3, h: 5.5 }, polaroid: false, gapCm: baseGapCm * 0.7 },
        };
let currentLayout = layoutConfigs[ Object.keys( layoutConfigs )[ 0 ] ];

function populateLayoutSelector ()
{
    for ( const key in layoutConfigs )
    {
        const option = document.createElement( 'option' );
        option.value = key;
                option.textContent = layoutConfigs[ key ].name;
                layoutSelector.appendChild( option );
            }
            layoutSelector.value = Object.keys( layoutConfigs )[ 0 ];
        }

function showMessage ( text, type = 'info', duration = 3000 )
{
    messageBox.textContent = text;
    messageBox.className = `message-box show ${ type }`;
    setTimeout( () => { messageBox.classList.remove( 'show' ); }, duration );
}

function updateMirrorButtonAndPreview ()
{
    mirrorToggleButton.textContent = `Cermin: ${ isMirrorMode ? 'Aktif' : 'Nonaktif' }`;
    if ( currentFacingMode === 'user' )
    {
        video.style.transform = isMirrorMode ? 'scaleX(-1)' : 'scaleX(1)';
            } else
            {
                video.style.transform = 'scaleX(1)';
            }
            mirrorToggleButton.classList.toggle( 'opacity-50', currentFacingMode !== 'user' );
            mirrorToggleButton.disabled = currentFacingMode !== 'user';
            if ( currentFacingMode !== 'user' )
            {
                isMirrorMode = false;
                mirrorToggleButton.textContent = `Cermin: Nonaktif`;
            }
        }

function applyPhotoFiltersToPreview ()
{
    const filterString = `brightness(${ editBrightness }%) contrast(${ editContrast }%) ${ editGrayscale ? 'grayscale(100%)' : '' }`;
    const images = photoLayoutArea.querySelectorAll( '.polaroid-image-wrapper img, .photo-slot-plain img' );
    images.forEach( img =>
    {
        img.style.filter = filterString.trim();
            } );
}

function renderLiveDecorationsPreview ()
{
    stickerPreviewOverlay.innerHTML = '';
    textPreviewOverlay.innerHTML = '';

            let stickerCountsByType = {};
            addedStickers.forEach( sticker =>
            {
                if ( !stickerCountsByType[ sticker.type ] ) stickerCountsByType[ sticker.type ] = 0;
                const positions = stickerPreviewPositions[ sticker.type ];
                const posIndex = stickerCountsByType[ sticker.type ] % positions.length;
                const pos = positions[ posIndex ];
                const stickerEl = document.createElement( 'div' );
                stickerEl.classList.add( 'live-sticker' );
                stickerEl.textContent = sticker.emoji;
                stickerEl.style.top = pos.top;
                stickerEl.style.left = pos.left;
                stickerEl.style.transform = 'translate(-50%, -50%)';
                stickerPreviewOverlay.appendChild( stickerEl );
                stickerCountsByType[ sticker.type ]++;
            } );

            addedTexts.forEach( textObj =>
            {
                const textEl = document.createElement( 'div' );
                textEl.classList.add( 'live-text-preview' );
                textEl.dataset.textId = textObj.id;
                textEl.textContent = textObj.text;
                textEl.style.fontFamily = `"${ textObj.family }", sans-serif`;
                textEl.style.fontSize = `${ ptToPxPreview( textObj.size ) }px`;
                textEl.style.color = textObj.color;
                textEl.style.fontWeight = textObj.weight;

                const containerRect = textPreviewOverlay.getBoundingClientRect();
                if ( containerRect.width === 0 || containerRect.height === 0 )
                {
                    console.warn( "Text preview overlay has zero dimensions during text render." );
                    return;
                }

                let xPosPercent = 50, yPosPercent = 50;
                let textAlign = 'center', textBaseline = 'middle';

                switch ( textObj.position )
                {
                    case 'top-center': yPosPercent = 10; textAlign = 'center'; textBaseline = 'top'; break;
                    case 'bottom-center': yPosPercent = 90; textAlign = 'center'; textBaseline = 'bottom'; break;
                    case 'middle-center': yPosPercent = 50; textAlign = 'center'; textBaseline = 'middle'; break;
                    case 'top-left': yPosPercent = 5; xPosPercent = 5; textAlign = 'left'; textBaseline = 'top'; break;
                    case 'top-right': yPosPercent = 5; xPosPercent = 95; textAlign = 'right'; textBaseline = 'top'; break;
                    case 'bottom-left': yPosPercent = 95; xPosPercent = 5; textAlign = 'left'; textBaseline = 'bottom'; break;
                    case 'bottom-right': yPosPercent = 95; xPosPercent = 95; textAlign = 'right'; textBaseline = 'bottom'; break;
                }
                textEl.style.top = `${ yPosPercent }%`;
                textEl.style.left = `${ xPosPercent }%`;

                let transformOriginX = '50%', transformOriginY = '50%';
                if ( textAlign === 'left' ) transformOriginX = '0%';
                else if ( textAlign === 'right' ) transformOriginX = '100%';
                if ( textBaseline === 'top' ) transformOriginY = '0%';
                else if ( textBaseline === 'bottom' ) transformOriginY = '100%';

                textEl.style.transform = `translate(-${ transformOriginX }, -${ transformOriginY })`;

                textPreviewOverlay.appendChild( textEl );
            } );
        }


async function getMedia ( constraints )
{
    try
    {
        if ( currentStream ) currentStream.getTracks().forEach( track => track.stop() );
        currentStream = await navigator.mediaDevices.getUserMedia( constraints );
        video.srcObject = currentStream;
        await video.play();
        const devices = await navigator.mediaDevices.enumerateDevices();
                const videoInputs = devices.filter( device => device.kind === 'videoinput' );
                switchCameraButton.classList.toggle( 'hidden', videoInputs.length <= 1 );
                showMessage( "Kamera siap!", "success" );
                captureButton.disabled = false;
                captureButton.classList.remove( 'opacity-50', 'cursor-not-allowed' );
                updateMirrorButtonAndPreview();
            } catch ( err )
            {
                console.error( "Error mengakses kamera: ", err );
                let msg = "Tidak bisa mengakses kamera.";
                if ( err.name === "NotAllowedError" ) msg = "Izin kamera ditolak.";
                else if ( err.name === "NotFoundError" ) msg = "Kamera tidak ditemukan.";
                else if ( err.name === "NotReadableError" ) msg = "Kamera sedang digunakan aplikasi lain.";
                showMessage( msg, "error", 5000 );
                captureButton.disabled = true;
                captureButton.classList.add( 'opacity-50', 'cursor-not-allowed' );
            }
        }

async function switchCamera ()
{
    if ( !currentStream ) { showMessage( "Kamera belum diinisialisasi.", "error" ); return; }
    currentFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
            isMirrorMode = ( currentFacingMode === 'user' );
            showMessage( `Mengganti ke kamera ${ currentFacingMode === 'user' ? 'depan' : 'belakang' }...`, "info" );
            await getMedia( { video: { facingMode: { exact: currentFacingMode }, width: { ideal: 1280 }, height: { ideal: 720 } } } );
        }

mirrorToggleButton.addEventListener( 'click', () =>
{
    if ( currentFacingMode === 'user' )
    {
        isMirrorMode = !isMirrorMode;
        updateMirrorButtonAndPreview();
                showMessage( `Mode cermin ${ isMirrorMode ? 'diaktifkan' : 'dinonaktifkan' }.`, "info", 1500 );
            } else
            {
                showMessage( "Mode cermin hanya untuk kamera depan.", "info", 2000 );
            }
        } );

function renderPhotoSlots ()
{
    photoLayoutArea.innerHTML = '';
            photoLayoutArea.style.gridTemplateColumns = `repeat(${ currentLayout.cols }, minmax(0, 1fr))`;

            for ( let i = 0; i < currentLayout.slots; i++ )
            {
                const slotContainer = document.createElement( 'div' );
                if ( currentLayout.polaroid )
                {
                    slotContainer.classList.add( 'polaroid-frame' );
                    slotContainer.id = `slot-frame-${ i }`;
                    const imageWrapper = document.createElement( 'div' );
                    imageWrapper.classList.add( 'polaroid-image-wrapper' );
                    imageWrapper.style.aspectRatio = `${ currentLayout.photoContentCm.w } / ${ currentLayout.photoContentCm.h }`;
                    if ( capturedPhotosData[ i ] )
                    {
                        const img = document.createElement( 'img' );
                        img.src = capturedPhotosData[ i ];
                        imageWrapper.appendChild( img );
                    }
                    slotContainer.appendChild( imageWrapper );
                } else
                {
                    slotContainer.classList.add( 'photo-slot-plain' );
                    slotContainer.id = `slot-plain-${ i }`;
                    slotContainer.style.aspectRatio = `${ currentLayout.photoContentCm.w } / ${ currentLayout.photoContentCm.h }`;
                    if ( capturedPhotosData[ i ] )
                    {
                        const img = document.createElement( 'img' );
                        img.src = capturedPhotosData[ i ];
                        slotContainer.appendChild( img );
                    }
                }
                photoLayoutArea.appendChild( slotContainer );
            }
            applyPhotoFiltersToPreview();
            renderLiveDecorationsPreview();
            updateButtonStates();
        }

function updateButtonStates ()
{
    const allSlotsFilled = currentPhotoCount >= currentLayout.slots;
    captureButton.disabled = allSlotsFilled || !currentStream;
            captureButton.classList.toggle( 'opacity-50', captureButton.disabled );
            captureButton.classList.toggle( 'cursor-not-allowed', captureButton.disabled );

    editingControlsPanel.classList.toggle( 'hidden', !allSlotsFilled );
    resetButton.classList.toggle( 'hidden', currentPhotoCount === 0 && !allSlotsFilled );
    captureButton.textContent = allSlotsFilled ? "Slot Penuh, Edit & Download!" : "Ambil Foto";
}

function resetEditStates ()
{
    editBrightness = 100; brightnessSlider.value = 100; brightnessValueSpan.textContent = 100;
    editContrast = 100; contrastSlider.value = 100; contrastValueSpan.textContent = 100;
    editGrayscale = false; grayscaleToggle.checked = false;
    addedStickers = []; nextStickerId = 0;
    addedTexts = []; nextTextId = 0;
    textInput.value = '';
    fontFamilySelector.value = 'Arial';
    fontSizeInput.value = 16;
    fontColorPicker.value = '#FFFFFF';
    textBoldToggle.checked = false;
            textPositionSelector.value = 'top-center';
            textTemplateCategorySelector.value = "";
            textTemplateSelector.innerHTML = '<option value="">Pilih Kata-Kata</option>';


            updateStickerCountDisplay();
            updateTextCountDisplay();
        }

function handleLayoutChange ()
{
    currentLayout = layoutConfigs[ layoutSelector.value ];
    capturedPhotosData = [];
    currentPhotoCount = 0;
    resetEditStates();
    renderPhotoSlots();
            showMessage( `Tata letak diubah ke: ${ currentLayout.name }`, "info" );
        }

function resetApp ()
{
    capturedPhotosData = [];
    currentPhotoCount = 0;
    resetEditStates();
    renderPhotoSlots();
            editingControlsPanel.classList.add( 'hidden' );
            showMessage( "Foto telah direset.", "info" );
        }

captureButton.addEventListener( 'click', () =>
{
    if ( !currentStream || !video.srcObject || currentPhotoCount >= currentLayout.slots )
    {
        if ( currentPhotoCount >= currentLayout.slots ) showMessage( "Semua slot sudah terisi.", "info" );
        else showMessage( "Kamera belum siap.", "error" );
        return;
    }
            if ( video.videoWidth === 0 || video.videoHeight === 0 || video.offsetWidth === 0 || video.offsetHeight === 0 )
            {
                showMessage( "Video stream belum siap atau tidak terlihat, coba lagi.", "info" ); return;
            }

            const targetCanvas = canvas;
            const videoEl = video;
            targetCanvas.width = videoEl.offsetWidth;
            targetCanvas.height = videoEl.offsetHeight;
            const context = targetCanvas.getContext( '2d' );
            context.clearRect( 0, 0, targetCanvas.width, targetCanvas.height );

            const vIntrinsicW = videoEl.videoWidth, vIntrinsicH = videoEl.videoHeight;
            const vIntrinsicAspect = vIntrinsicW / vIntrinsicH;
            const cDisplayW = targetCanvas.width, cDisplayH = targetCanvas.height;
            const cDisplayAspect = cDisplayW / cDisplayH;
            let sx = 0, sy = 0, sWidth = vIntrinsicW, sHeight = vIntrinsicH;

            if ( vIntrinsicAspect > cDisplayAspect )
            {
                sWidth = vIntrinsicH * cDisplayAspect; sx = ( vIntrinsicW - sWidth ) / 2;
            } else if ( vIntrinsicAspect < cDisplayAspect )
            {
                sHeight = vIntrinsicW / cDisplayAspect; sy = ( vIntrinsicH - sHeight ) / 2;
            }

            context.save();
            if ( currentFacingMode === 'user' && isMirrorMode )
            {
                context.translate( cDisplayW, 0 ); context.scale( -1, 1 );
            }
            context.drawImage( videoEl, sx, sy, sWidth, sHeight, 0, 0, cDisplayW, cDisplayH );
            context.restore();

            const dataURL = targetCanvas.toDataURL( 'image/png' );
            capturedPhotosData[ currentPhotoCount ] = dataURL;

            renderPhotoSlots();

            currentPhotoCount++; 
            updateButtonStates(); 
            showMessage( "Foto berhasil diambil!", "success", 1500 );
        } );

brightnessSlider.addEventListener( 'input', ( e ) =>
{
    editBrightness = parseInt( e.target.value );
    brightnessValueSpan.textContent = editBrightness;
    applyPhotoFiltersToPreview();
        } );
contrastSlider.addEventListener( 'input', ( e ) =>
{
    editContrast = parseInt( e.target.value );
    contrastValueSpan.textContent = editContrast;
    applyPhotoFiltersToPreview();
        } );
grayscaleToggle.addEventListener( 'change', ( e ) =>
{
    editGrayscale = e.target.checked;
    applyPhotoFiltersToPreview();
        } );
bgColorPicker.addEventListener( 'input', ( e ) =>
{
    photoLayoutAreaContainer.style.backgroundColor = e.target.value;
        } );

function updateStickerCountDisplay ()
{
    stickerAddButtons.forEach( button =>
    {
        const type = button.dataset.stickerType;
                const count = addedStickers.filter( s => s.type === type ).length;
                const span = button.querySelector( `[data-sticker-count="${ type }"]` );
                if ( span ) span.textContent = count;
            } );
}

function updateTextCountDisplay ()
{
    // Implementasi jika diperlukan untuk menampilkan jumlah teks
}


stickerAddButtons.forEach( button =>
{
    button.addEventListener( 'click', () =>
    {
        const type = button.dataset.stickerType;
        const emoji = button.dataset.stickerEmoji;
                if ( !emoji ) return;
                addedStickers.push( { id: nextStickerId++, type: type, emoji: emoji } );
                updateStickerCountDisplay();
                renderLiveDecorationsPreview();
            } );
        } );

removeLastStickerButton.addEventListener( 'click', () =>
{
    if ( addedStickers.length > 0 )
    {
        addedStickers.pop();
        updateStickerCountDisplay();
        renderLiveDecorationsPreview();
                showMessage( "Hiasan terakhir dihapus.", "info", 1500 );
            } else
            {
                showMessage( "Tidak ada hiasan untuk dihapus.", "info", 1500 );
            }
        } );

textTemplateCategorySelector.addEventListener( 'change', ( e ) =>
{
    const category = e.target.value;
    textTemplateSelector.innerHTML = '<option value="">Pilih Kata-Kata</option>';
            if ( category && templateTexts[ category ] )
            {
                templateTexts[ category ].forEach( quote =>
                {
                    const option = document.createElement( 'option' );
                    option.value = quote;
                    option.textContent = quote.substring( 0, 30 ) + ( quote.length > 30 ? '...' : '' );
                    textTemplateSelector.appendChild( option );
                } );
            }
        } );

textTemplateSelector.addEventListener( 'change', ( e ) =>
{
    if ( e.target.value )
    {
        textInput.value = e.target.value;
    }
        } );

addTextButton.addEventListener( 'click', () =>
{
    const text = textInput.value.trim();
            if ( !text )
            {
                showMessage( "Silakan masukkan teks terlebih dahulu.", "info" );
                return;
            }
            const family = fontFamilySelector.value;
            const size = fontSizeInput.value;
            const color = fontColorPicker.value;
            const weight = textBoldToggle.checked ? 'bold' : 'normal';
            const position = textPositionSelector.value;

            addedTexts.push( { id: nextTextId++, text, family, size, color, weight, position } );
            updateTextCountDisplay();
            renderLiveDecorationsPreview();
        } );

removeLastTextButton.addEventListener( 'click', () =>
{
    if ( addedTexts.length > 0 )
    {
        addedTexts.pop();
        updateTextCountDisplay();
        renderLiveDecorationsPreview();
                showMessage( "Teks terakhir dihapus.", "info", 1500 );
            } else
            {
                showMessage( "Tidak ada teks untuk dihapus.", "info", 1500 );
            }
        } );


downloadButton.addEventListener( 'click', async () =>
{
    if ( capturedPhotosData.length < currentLayout.slots )
    {
        showMessage( "Belum semua foto diambil.", "error" ); return;
    }
            showMessage( "Mempersiapkan file unduhan...", "info", 5000 );

            const compositeCanvas = document.createElement( 'canvas' );
            const ctx = compositeCanvas.getContext( '2d' );

            const photoCm = currentLayout.photoContentCm;
            const polaroidPadCm = currentLayout.polaroid ? currentLayout.polaroidPaddingCm : { top: 0, right: 0, bottom: 0, left: 0 };
            const gapCm = currentLayout.gapCm;
            const overallMarginPx = cmToPx( CANVAS_MARGIN_CM );

            const pContentW_px = cmToPx( photoCm.w );
            const pContentH_px = cmToPx( photoCm.h );
            const polPadT_px = cmToPx( polaroidPadCm.top );
            const polPadR_px = cmToPx( polaroidPadCm.right );
            const polPadB_px = cmToPx( polaroidPadCm.bottom );
            const polPadL_px = cmToPx( polaroidPadCm.left );
            const gap_px = cmToPx( gapCm );

            const singleElementW_px = pContentW_px + ( currentLayout.polaroid ? ( polPadL_px + polPadR_px ) : 0 );
            const singleElementH_px = pContentH_px + ( currentLayout.polaroid ? ( polPadT_px + polPadB_px ) : 0 );

            const totalContentWidth = ( singleElementW_px * currentLayout.cols ) + ( gap_px * ( currentLayout.cols - 1 ) );
            const totalContentHeight = ( singleElementH_px * currentLayout.rows ) + ( gap_px * ( currentLayout.rows - 1 ) );

            compositeCanvas.width = totalContentWidth + ( overallMarginPx * 2 );
            compositeCanvas.height = totalContentHeight + ( overallMarginPx * 2 );

            ctx.fillStyle = bgColorPicker.value;
            ctx.fillRect( 0, 0, compositeCanvas.width, compositeCanvas.height );

            const imageLoadPromises = capturedPhotosData.map( dataUrl =>
            {
                return new Promise( ( resolve, reject ) =>
                {
                    const img = new Image();
                    img.onload = () => resolve( img );
                    img.onerror = ( err ) => reject( new Error( "Gagal memuat gambar." ) );
                    img.src = dataUrl;
                } );
            } );

            try
            {
                const images = await Promise.all( imageLoadPromises );
                for ( let i = 0; i < images.length; i++ )
                {
                    const img = images[ i ];
                    const colIdx = i % currentLayout.cols;
                    const rowIdx = Math.floor( i / currentLayout.cols );

                    const elementX_no_margin = colIdx * ( singleElementW_px + gap_px );
                    const elementY_no_margin = rowIdx * ( singleElementH_px + gap_px );

                    const elementX = elementX_no_margin + overallMarginPx;
                    const elementY = elementY_no_margin + overallMarginPx;

                    if ( currentLayout.polaroid )
                    {
                        ctx.fillStyle = 'white';
                        ctx.shadowColor = 'rgba(0,0,0,0.2)';
                        ctx.shadowBlur = cmToPx( 0.15 );
                        ctx.shadowOffsetX = cmToPx( 0.1 );
                        ctx.shadowOffsetY = cmToPx( 0.1 );
                        ctx.fillRect( elementX, elementY, singleElementW_px, singleElementH_px );
                        ctx.shadowColor = 'transparent';
                    }

                    const photoX_in_element = elementX + ( currentLayout.polaroid ? polPadL_px : 0 );
                    const photoY_in_element = elementY + ( currentLayout.polaroid ? polPadT_px : 0 );

                    ctx.save();
                    const filterString = `brightness(${ editBrightness }%) contrast(${ editContrast }%) ${ editGrayscale ? 'grayscale(100%)' : '' }`;
                    if ( filterString.trim() !== '' )
                    {
                        ctx.filter = filterString.trim();
                    }
                    ctx.drawImage( img, photoX_in_element, photoY_in_element, pContentW_px, pContentH_px );
                    ctx.restore();
                }

                let stickerCountsByTypeDownload = {};
                addedStickers.forEach( sticker =>
                {
                    if ( !stickerCountsByTypeDownload[ sticker.type ] ) stickerCountsByTypeDownload[ sticker.type ] = 0;
                    const positions = stickerPreviewPositions[ sticker.type ];
                    const posIndex = stickerCountsByTypeDownload[ sticker.type ] % positions.length;
                    if ( positions && posIndex < positions.length )
                    {
                        const posPercent = positions[ posIndex ];
                        const stickerDrawX = overallMarginPx + ( parseFloat( posPercent.left ) / 100 * totalContentWidth );
                        const stickerDrawY = overallMarginPx + ( parseFloat( posPercent.top ) / 100 * totalContentHeight );
                        ctx.font = `${ cmToPx( 1.2 ) }px sans-serif`;
                        ctx.textAlign = "center";
                        ctx.textBaseline = "middle";
                         if ( sticker.type === 'heart' ) ctx.fillStyle = 'red';
                         else if ( sticker.type === 'star' ) ctx.fillStyle = 'gold';
                         else if ( sticker.type === 'pentol' ) ctx.fillStyle = 'rgba(100, 150, 255, 0.9)';
                         ctx.fillText( sticker.emoji, stickerDrawX, stickerDrawY );
                         stickerCountsByTypeDownload[ sticker.type ]++;
                     }
                } );

                addedTexts.forEach( textObj =>
                {
                    let textDrawX, textDrawY;
                    ctx.font = `${ textObj.weight === 'bold' ? 'bold ' : '' }${ ptToPxDownload( textObj.size ) }px "${ textObj.family }"`;
                    ctx.fillStyle = textObj.color;

                    switch ( textObj.position )
                    {
                        case 'top-center':
                            ctx.textAlign = 'center'; ctx.textBaseline = 'top';
                            textDrawX = overallMarginPx + totalContentWidth / 2;
                            textDrawY = overallMarginPx + cmToPx( 0.3 );
                            break;
                        case 'bottom-center':
                            ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
                            textDrawX = overallMarginPx + totalContentWidth / 2;
                            textDrawY = compositeCanvas.height - overallMarginPx - cmToPx( 0.3 );
                            break;
                        case 'middle-center':
                            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                            textDrawX = overallMarginPx + totalContentWidth / 2;
                            textDrawY = overallMarginPx + totalContentHeight / 2;
                            break;
                        case 'top-left':
                            ctx.textAlign = 'left'; ctx.textBaseline = 'top';
                            textDrawX = overallMarginPx + cmToPx( 0.3 );
                            textDrawY = overallMarginPx + cmToPx( 0.3 );
                            break;
                        case 'top-right':
                            ctx.textAlign = 'right'; ctx.textBaseline = 'top';
                            textDrawX = compositeCanvas.width - overallMarginPx - cmToPx( 0.3 );
                            textDrawY = overallMarginPx + cmToPx( 0.3 );
                            break;
                        case 'bottom-left':
                            ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
                            textDrawX = overallMarginPx + cmToPx( 0.3 );
                            textDrawY = compositeCanvas.height - overallMarginPx - cmToPx( 0.3 );
                            break;
                        case 'bottom-right':
                            ctx.textAlign = 'right'; ctx.textBaseline = 'bottom';
                            textDrawX = compositeCanvas.width - overallMarginPx - cmToPx( 0.3 );
                            textDrawY = compositeCanvas.height - overallMarginPx - cmToPx( 0.3 );
                            break;
                        default:
                            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                            textDrawX = overallMarginPx + totalContentWidth / 2;
                            textDrawY = overallMarginPx + totalContentHeight / 2;
                    }
                    ctx.fillText( textObj.text, textDrawX, textDrawY );
                } );


                const finalImageURL = compositeCanvas.toDataURL( 'image/png' );
                const a = document.createElement( 'a' );
                a.href = finalImageURL;
                a.download = `photobox_edited_${ layoutSelector.value }_${ Date.now() }.png`;
                document.body.appendChild( a );
                a.click();
                document.body.removeChild( a );
                showMessage( "Hasil cetak berhasil diunduh!", "success" );
            } catch ( error )
            {
                console.error( "Error saat membuat gambar unduhan:", error );
                showMessage( error.message || "Gagal memproses gambar untuk unduhan.", "error" );
            }
        } );

switchCameraButton.addEventListener( 'click', switchCamera );
resetButton.addEventListener( 'click', resetApp );
layoutSelector.addEventListener( 'change', handleLayoutChange );

window.addEventListener( 'load', () =>
{
    populateLayoutSelector();
            setTimeout( () =>
            {
                getMedia( { video: { facingMode: currentFacingMode }, width: { ideal: 1280 }, height: { ideal: 720 } } );
                handleLayoutChange();
                photoLayoutAreaContainer.style.backgroundColor = bgColorPicker.value;
            }, 100 );
        } );