const fs = require('fs');
const path = require('path');

// Function to delete an image
const deleteImage = (imagePath) => {
    fs.unlink(imagePath, (err) => {
        if (err) {
            console.error(`Error deleting file: ${err.message}`);
            return;
        }
        console.log(`File deleted successfully: ${imagePath}`);
    });
};

// Example usage
const folderPath = path.join(__dirname, 'uploads'); // Replace 'uploads' with your folder name
const imageName = 'example.jpg'; // Replace with the image name you want to delete
const imagePath = path.join(folderPath, imageName);

deleteImage(imagePath);




const deleteImage = (imagePath) => {
    fs.stat(imagePath, (err, stats) => {
        if (err) {
            console.error(`File not found or inaccessible: ${err.message}`);
            return;
        }

        // File exists, proceed to delete
        fs.unlink(imagePath, (err) => {
            if (err) {
                console.error(`Error deleting file: ${err.message}`);
                return;
            }
            console.log(`File deleted successfully: ${imagePath}`);
        });
    });
};





const deleteImages = (folderPath, fileNames) => {
    fileNames.forEach((fileName) => {
        const imagePath = path.join(folderPath, fileName);
        fs.unlink(imagePath, (err) => {
            if (err) {
                console.error(`Error deleting file ${fileName}: ${err.message}`);
            } else {
                console.log(`File deleted successfully: ${fileName}`);
            }
        });
    });
};

// Example usage
const folderPath = path.join(__dirname, 'uploads');
const filesToDelete = ['image1.jpg', 'image2.png', 'image3.jpeg'];

deleteImages(folderPath, filesToDelete);

