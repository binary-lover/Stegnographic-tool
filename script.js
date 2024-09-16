
let encodebtn = document.getElementById("encodebtn")
let encodeimage1fileinput = document.getElementById("encodeimage1")


let canvasbox = document.getElementById("canvasbox")
let secretTextField = document.getElementById("secretText");

let loadedImage;
let encodedImage;

let decodebtn = document.getElementById("decodebtn")
let decodeimage1fileinput = document.getElementById("decodeimage1")
let decodeimage2fileinput = document.getElementById("decodeimage2")


let decodeimage1;
let decodeimage2;


encodebtn.addEventListener("click", e => {
    console.log("encoding...")
    encodebtn.classList.add("disbaled")
    // load image from encodeimage1fileinput and display in canvasbox
    // Check if a file is selected
    if (encodeimage1fileinput.files && encodeimage1fileinput.files[0]) {
        // Use p5.js loadImage function to load the image
        loadedImage = loadImage(URL.createObjectURL(encodeimage1fileinput.files[0]), () => {
            // Draw the loaded image to the canvasbox div
            //   createCanvas(loadedImage.width, loadedImage.height).parent('canvasbox');
            //    image(loadedImage, 0, 0);

            loadedImage.loadPixels();
            console.log("Pixel data:", loadedImage.pixels);



            // Get the text to hide
            let secretText = secretTextField.value;
            console.log("secret message:", secretText)

            // Encode the message in the image
            encodedImage = createImage(loadedImage.width, loadedImage.height);
            encodedImage.copy(loadedImage, 0, 0, loadedImage.width, loadedImage.height, 0, 0, loadedImage.width, loadedImage.height);

            encodedImage.loadPixels()
            console.log("Pixel data:", encodedImage.pixels);

            // Encode the message in the image
            encodeMessage(encodedImage, secretText);

            // Display the modified image
            //  createCanvas(encodedImage.width, encodedImage.height).parent('canvasbox');
            //  image(encodedImage, 0, 0);


            // force download the encodedimage

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
    if (decodeimage1fileinput.files && decodeimage1fileinput.files[0] && decodeimage2fileinput.files && decodeimage2fileinput.files[0]) {
        // Load the two images
        loadImage(URL.createObjectURL(decodeimage1fileinput.files[0]), img1 => {
            loadImage(URL.createObjectURL(decodeimage2fileinput.files[0]), img2 => {
                // Display the original image
                // createCanvas(img1.width, img1.height).parent('canvasbox');
                //   image(img1, 0, 0);

                // Display the image with the hidden message
                //   createCanvas(img2.width, img2.height).parent('canvasbox');
                //   image(img2, 0, 0);

                img1.loadPixels()
                img2.loadPixels()
                console.log("image 1:", img1)
                console.log("image 2:", img2)

                // Decode the hidden message
                let decodedMessage = decodeMessage(img1);
                console.log("Decoded Message:", decodedMessage);


                // Enable the decode button after decoding
                //    decodebtn.classList.remove("disabled");


                secretTextField.value = decodedMessage

            });
        });
    } else {
        alert("Please select both image files.");
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
    let binaryMessage = textToBinary(message);
    console.log("Binary Message:", binaryMessage);

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

    console.log("Decoded Message:", textMessage);
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
