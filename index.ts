// Get the drop zone element
window.onload = function() {
    const dropZone = document.getElementById('drop_zone')! as HTMLElement;

    // Add the event listeners
    dropZone.addEventListener('dragover', handleDragOver, false);
    dropZone.addEventListener('drop', handleFileSelect, false);
};

function handleDragOver(evt: DragEvent) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer!.dropEffect = 'copy'; // Show as copy
}


function handleFileSelect(evt: DragEvent) {
    evt.stopPropagation();
    evt.preventDefault();

    const files = evt.dataTransfer!.files; // FileList object.

    const imageInput = document.getElementById('image_input') as HTMLInputElement;
    imageInput.files = files;
}


function ascii_convert() {

    const image_input = document.getElementById('image_input')! as HTMLInputElement;
    const scaling_factor = document.getElementById('scale')! as HTMLInputElement;
    const file = image_input.files![0];

    if (file) {
        const reader = new FileReader();

        reader.onload = function (e) {
            const image = new Image();
            image.src = e.target!.result as string;

            image.onload = function () {
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                const scalingFactor = parseInt(scaling_factor.value) / 100; // Get the scaling factor value from the input element
                const newWidth = Math.round(image.width * scalingFactor); // Calculate the new width based on the scaling factor
                const newHeight = Math.round(image.height * scalingFactor); // Calculate the new height based on the scaling factor
                canvas.width = newWidth;
                canvas.height = newHeight;
                canvas.style.display = 'none'; // Make the canvas invisible
                context!.drawImage(image, 0, 0, newWidth, newHeight); // Draw the image with the new dimensions
                const imageData = context!.getImageData(0, 0, newWidth, newHeight);
                const pixels = imageData.data;
                // Use the pixels array here
                const ascii = pixels_to_ascii(pixels, newWidth);

                // Open a new browser tab with the ASCII text
                const asciiWindow = window.open();
                if (asciiWindow) {
                    asciiWindow.document.write(`<pre style="font-family: monospace; line-height: 1ch; font-size: small; background-color: white; color: black; font-weight: regular">${ascii}</pre>`); // Set line-height to 1, font-size to small, background-color to white, color to black, and font-weight to bold
                    asciiWindow.document.close();
                } else {
                    console.error('Failed to open new window');
                }
            };
        };

        reader.readAsDataURL(file);
    }
}


const ASCII_CHARACTERS = [' ', '.', '°', '*', 'o', 'O', '#', '@'];


function brightness_to_character(brightness: number) {
    const character_index = Math.floor(brightness / 32);
    return ASCII_CHARACTERS[character_index];
}


function pixels_to_ascii(pixels: Uint8ClampedArray, width: number) {
    let ascii = '';
    for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const a = pixels[i + 3] / 255;

        const brightness = (r + g + b) / 3 * a;
        
        const character = brightness_to_character(brightness);
        ascii += character;

        if ((i + 4) % (width * 4) === 0) {
            ascii += '\n';
        }
    }
    return ascii;
}


