
let encodebtn = document.getElementById("encodebtn")
let encodeimage1fileinput = document.getElementById("encodeimage1")


let canvasbox = document.getElementById("canvasbox")
let secretTextField = document.getElementById("secretText");

let loadedImage;
let encodedImage;

let decodebtn = document.getElementById("decodebtn")
let decodeimage1fileinput = document.getElementById("decodeimage1")

let encodePass = document.getElementById("passphrase1")
let decodePass = document.getElementById("passphrase2")

let decodeimage1;


encodebtn.addEventListener("click", e => {
    console.log("encoding...")
    encodebtn.classList.add("disbaled")
    
    // load image from encodeimage1fileinput and display in canvasbox
    // Check if a file is selected
    if (encodeimage1fileinput.files && encodeimage1fileinput.files[0]) {
        // Use p5.js loadImage function to load the image
        loadedImage = loadImage(URL.createObjectURL(encodeimage1fileinput.files[0]), () => {

            loadedImage.loadPixels();

            // Get the text to hide
            let secretText = secretTextField.value;

            // Encode the message in the image
            encodedImage = createImage(loadedImage.width, loadedImage.height);
            encodedImage.copy(loadedImage, 0, 0, loadedImage.width, loadedImage.height, 0, 0, loadedImage.width, loadedImage.height);

            encodedImage.loadPixels()
            // Encode the message in the image
            encodeMessage(encodedImage, secretText);
            downloadEncodedImage(encodedImage, 'encoded_image.jpg');


        });
    } else {
        alert("Please select an image file.");
    }
})

decodebtn.addEventListener("click", e => {
    console.log("decoding...")
    decodebtn.classList.add("disbaled")

    //load images - first one is original and second one with message. compare them and find the message inside
    // Check if both files are selected
    if (decodeimage1fileinput.files && decodeimage1fileinput.files[0] ) {
        // Load the two images
        loadImage(URL.createObjectURL(decodeimage1fileinput.files[0]), img1 => { // Original image
            

                img1.loadPixels()

                // Decode the hidden message
                let decodedMessage = decodeMessage(img1);
                secretTextField.value = decodedMessage
            
        });
    } else {
        alert("Please select an image files.");
    }

})


// Define the p5.js sketch
function setup() {
}


function draw() {
    noLoop()
}

// Function to encode the message by modifying color channels
function encodeMessage(img, message) {
    message = checkIfPassphraseExists(message, encodePass.value)
    let binaryMessage = textToBinary(message);
    

    // Calculate the number of pixels needed to store the message
    let numPixels = Math.ceil(binaryMessage.length / 3); // Each pixel stores 3 bits (1 per channel)

    // Check if the image is large enough to store the message
    if (numPixels + 11 > img.pixels.length / 4) {
        console.log("Image is too small to store the message.");
        return;
    }

    img.loadPixels(); // Load the image's pixel data

    let binaryIndex = 0; // Index to track the current bit in the binary message

    // Loop through each pixel to encode the message
    for (let i = 0; i < numPixels; i++) {
        let pixelIndex = i * 4; // Calculate the index of the current pixel

        // Extract the current pixel's RGBA values
        let r = img.pixels[pixelIndex];
        let g = img.pixels[pixelIndex + 1];
        let b = img.pixels[pixelIndex + 2];
        let a = img.pixels[pixelIndex + 3];

        // Modify the RGB channels based on the binary message
        if (binaryIndex < binaryMessage.length) {
            // Red channel
            r = (r & 0b11111110) | parseInt(binaryMessage[binaryIndex++]); // Set the LSB
        }
        if (binaryIndex < binaryMessage.length) {
            // Green channel
            g = (g & 0b11111110) | parseInt(binaryMessage[binaryIndex++]); // Set the LSB
        }
        if (binaryIndex < binaryMessage.length) {
            // Blue channel
            b = (b & 0b11111110) | parseInt(binaryMessage[binaryIndex++]); // Set the LSB
        }

        // Update the pixel in the image
        img.pixels[pixelIndex] = r; // Red
        img.pixels[pixelIndex + 1] = g; // Green
        img.pixels[pixelIndex + 2] = b; // Blue
        img.pixels[pixelIndex + 3] = a; // Alpha
    }

    // Create a pixel with black color and add it to the end of the text with alpha 0
    let blackPixel = [0, 0, 0, 0]; // R=0, G=0, B=0, A=0
    let endPixelIndex = numPixels * 4; // Position for the end pixel
    
    if (endPixelIndex + 4 <= img.pixels.length) { 
        img.pixels[endPixelIndex] = blackPixel[0]; // Red
        img.pixels[endPixelIndex + 1] = blackPixel[1]; // Green
        img.pixels[endPixelIndex + 2] = blackPixel[2]; // Blue
        img.pixels[endPixelIndex + 3] = blackPixel[3]; // Alpha
    }


    // update last pixel with black pixel if there is space
    let lastPixelIndex = img.pixels.length - 4;
    if(lastPixelIndex >= 0){
    img.pixels[img.pixels.length - 4] = blackPixel[0]; // Red
    img.pixels[img.pixels.length - 3] = blackPixel[1]; // Green
    img.pixels[img.pixels.length - 2] = blackPixel[2]; // Blue
    img.pixels[img.pixels.length - 1] = blackPixel[3]; // Alpha
    }

    img.updatePixels(); // Update the pixel data

}

function checkIfPassphraseExists(message, passphrase){
    if(passphrase.length > 0){
        // add '$' to the start and end of the passphrase
        passphrase = ">>" + passphrase + "<<"
        message = passphrase + message 
        
    }
    return message
}

// Helper function to convert text to binary
function textToBinary(text) {
    return text.split('').map(char => {
        return char.charCodeAt(0).toString(2).padStart(8, '0'); // Convert each char to 8-bit binary
    }).join('');
}


function downloadEncodedImage(img, filename) {
    // Create a temporary link
    let link = document.createElement('a');
    // Convert the canvas to data URL
    let dataURL = img.canvas.toDataURL();
    // Set the href attribute of the link to the data URL
    link.href = dataURL;
    // Set the download attribute with the desired filename
    link.download = filename;
    // Append the link to the document
    document.body.appendChild(link);
    // Programmatically trigger a click on the link
    link.click();
    // Remove the link from the document
    document.body.removeChild(link);
}


// Function to decode the hidden message

// Function to decode the message by comparing color channels
function decodeMessage(img) {
    img.loadPixels(); // Load the image's pixel data
    
    let binaryMessage = "";
    let numPixels = img.pixels.length / 4; // Number of pixels in the image

    // Extract the binary message from the image
    let foundEndMarker = false;
    let binaryIndex = 0; // To keep track of the bit position

    // check if last pixel is black
    let lastPixelIndex = img.pixels.length - 4;
    let lastPixel = img.pixels.slice(lastPixelIndex, lastPixelIndex + 4);
    if (lastPixel[0] === 0 && lastPixel[1] === 0 && lastPixel[2] === 0 && lastPixel[3] === 0) {
        console.log("there is a message in the image");
        
    }
    else{
        console.log("there is no message in the image");
        return "No message found in the image";
    }

    // check if image for decode contains passphrase by
    // compare if image contains passphrase
    let flag = checkForPassphraseMarker(img)
    if(decodePass.value.length < 1){
        if(flag){
            return "Error: Passphrase is required"
        }
    }

    if(flag && decodePass.value.length > 0){
        let isCorrect = comparePass(img, decodePass.value)
        if(!isCorrect){
            return "Error: Passphrase does not match"
        }
    }
    
    
    
    for (let i = 0; i < numPixels; i++) {
        if (foundEndMarker) break;

        let pixelIndex = i * 4; // Calculate the index of the current pixel

        // Extract the current pixel's RGBA values
        let r = img.pixels[pixelIndex];
        let g = img.pixels[pixelIndex + 1];
        let b = img.pixels[pixelIndex + 2];
        let a = img.pixels[pixelIndex + 3];

        // Check if the current pixel is the end marker
        if (r === 0 && g === 0 && b === 0 && a === 0) {
            foundEndMarker = true;
            break;
        }

        // Extract LSB from the red channel
        if (binaryIndex < binaryMessage.length + 3) {
            binaryMessage += (r & 0b00000001); // Extract LSB from red
            binaryIndex++;
        }

        // Extract LSB from the green channel
        if (binaryIndex < binaryMessage.length + 3) {
            binaryMessage += (g & 0b00000001); // Extract LSB from green
            binaryIndex++;
        }

        // Extract LSB from the blue channel
        if (binaryIndex < binaryMessage.length + 3) {
            binaryMessage += (b & 0b00000001); // Extract LSB from blue
            binaryIndex++;
        }
    }

    // Convert binary message to text
    let textMessage = "";
    for (let i = 0; i < binaryMessage.length; i += 8) {
        let byte = binaryMessage.slice(i, i + 8);
        if (byte.length < 8) break; // Ensure we have a complete byte
        textMessage += String.fromCharCode(parseInt(byte, 2)); // Convert binary to text
    }
    // remove passphrase markers
    if(flag){
        textMessage = textMessage.slice(2, textMessage.length)
        textMessage = textMessage.replace(decodePass.value, "") 
        textMessage = textMessage.slice(2, textMessage.length)
    }

    return textMessage;
}

// Helper function to convert binary string to text
function binaryToText(binary) {
    let text = "";
    for (let i = 0; i < binary.length; i += 8) {
        let byte = binary.slice(i, i + 8);
        if (byte.length < 8) break; // Ensure we have a complete byte
        text += String.fromCharCode(parseInt(byte, 2)); // Convert binary to text
    }
    return text;
}


function comparePass(img, inputPassphrase) {
    img.loadPixels(); // Load the image's pixel data
    let flag = false;
    
    let binaryMessage = "";
    let passphraseMarkerStart = ">>";
    let passphraseMarkerEnd = "<<";
    let passphraseMarkerLength = (passphraseMarkerStart.length + passphraseMarkerEnd.length + inputPassphrase.length) * 8; // Total bits for passphrase with markers

    let binaryIndex = 0;

    // Decode message until we reach the expected length of the passphrase (with markers)
    for (let i = 0; binaryIndex < passphraseMarkerLength && i < img.pixels.length; i += 4) {
        // Extract the RGB channels and get the least significant bit (LSB) from each
        let r = img.pixels[i] & 1;
        let g = img.pixels[i + 1] & 1;
        let b = img.pixels[i + 2] & 1;

        binaryMessage += r.toString() + g.toString() + b.toString();
        binaryIndex += 3; // We've processed 3 bits
    }

    // Convert the binary data to text
    let decodedPassphrase = binaryToText(binaryMessage);

    // Add markers to input passphrase
    inputPassphrase = passphraseMarkerStart + inputPassphrase + passphraseMarkerEnd;

    // Compare decoded passphrase with input passphrase
    if (decodedPassphrase.startsWith(inputPassphrase)) {
        flag = true;
    }
    
    return flag;
}


function checkForPassphraseMarker(img) {
    img.loadPixels(); // Load the image's pixel data

    let binaryMessage = "";
    let passphraseMarker = ">>";
    let passphraseMarkerLength = passphraseMarker.length * 8; // Each character is 8 bits

    let binaryIndex = 0;

    // Decode only enough pixels to check for the ">>" pattern (2 characters = 16 bits)
    for (let i = 0; binaryIndex < passphraseMarkerLength && i < img.pixels.length; i += 4) {
        // Extract the RGB channels and get the least significant bit (LSB) from each
        let r = img.pixels[i] & 1;
        let g = img.pixels[i + 1] & 1;
        let b = img.pixels[i + 2] & 1;

        binaryMessage += r.toString() + g.toString() + b.toString();
        binaryIndex += 3; // We've processed 3 bits
    }

    // Convert the binary data to text (only the first 16 bits to check for ">>")
    let decodedSnippet = binaryToText(binaryMessage.slice(0, passphraseMarkerLength));

    // Return true if the decoded snippet starts with ">>", otherwise false
    return decodedSnippet.startsWith(passphraseMarker);
}