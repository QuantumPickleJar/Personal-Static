// const stackImageMap = {
//   "Xamarin Forms": "xamarin-forms.png",
//   "C#": "csharp.png",
//   "JSON": "json.png",
//   "Visual Studio": "visual-studio.png",
//   "XML": "xml.png",
//   // ...add additional mappings as needed...
// };

// export function getStackImages(stackArray) {
//   return stackArray.map(item => {
//     const filename = stackImageMap[item] || null;
//     return { name: item, src: filename ? `/rsc/images/stack/${filename}` : null };
//   });
// }

export function initStackLayout() {
    const stackBox = document.getElementById('stackBox');
    console.debug("[stackParser] Initializing stack layout...");
    if (!stackBox) {
        console.error("[stackParser] No element with id 'stackBox' found.");
        return;
    }

    // Example layout initialization logic
    const images = stackBox.getElementsByTagName('img');
    console.debug(`[stackParser] Found ${images.length} image(s) in stackBox.`);
    for (let img of images) {
        img.style.margin = '10px';
        img.style.border = '1px solid #ccc';
        console.debug(`[stackParser] Applied styles to image with src: ${img.src}`);
    }

    // Additional layout logic can be added here
    console.log("Stack layout initialized");
}