// js/bookmarks.js

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded, starting bookmark fetch process.');
    fetchBookmarks();
});
  
async function fetchBookmarks() {
    console.log('Fetching bookmarks from /Personal-Static/rsc/json/bookmarks.json');
    try {
      const response = await fetch('/Personal-Static/rsc/json/bookmarks.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const bookmarks = await response.json();
      console.log('Bookmarks fetched successfully:', bookmarks);
      populateCategories(bookmarks);
      displayBookmarks(bookmarks);
  
      // Update displayed bookmarks when the category dropdown changes
      document.getElementById('bookmarkCategory').addEventListener('change', () => {
        displayBookmarks(bookmarks);
      });
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    }
}
  
function populateCategories(bookmarks) {
    const categorySelect = document.getElementById('bookmarkCategory');
    categorySelect.innerHTML = ''; // Clear any existing options
  
    // Create a set of unique categories from the bookmarks data
    const categories = Array.from(new Set(bookmarks.map(b => b.category).filter(Boolean)));
  
    // Add an "All" option to show all bookmarks
    const allOption = document.createElement('option');
    allOption.value = 'all';
    allOption.textContent = 'All';
    categorySelect.appendChild(allOption);
  
    // Add an option for each unique category
    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      categorySelect.appendChild(option);
    });
}
  
function createBookmarkElement(bookmark) {
    const bookmarkDiv = document.createElement('div');
    bookmarkDiv.classList.add('bookmark');
    
    const link = document.createElement('a');
    link.href = bookmark.url;
    link.textContent = bookmark.title;
    bookmarkDiv.appendChild(link);

    const category = document.createElement('p');
    category.textContent = bookmark.category;
    bookmarkDiv.appendChild(category);
  
    return bookmarkDiv;
}
  
function displayBookmarks(bookmarks) {
    const container = document.getElementById('bookmarksContainer');
    container.innerHTML = ''; // Clear any existing content
  
    // Get the selected category from the dropdown
    const selectedCategory = document.getElementById('bookmarkCategory').value;
    
    // Filter bookmarks based on the selected category (if not "all")
    const filteredBookmarks = selectedCategory === 'all'
      ? bookmarks
      : bookmarks.filter(b => b.category === selectedCategory);
  
    // Create an element for each bookmark
    filteredBookmarks.forEach(bookmark => {
        const bookmarkEl = document.createElement('div');
      bookmarkEl.className = 'bookmark';
  
      // Each bookmark includes a link to the resource
      bookmarkEl.innerHTML = `<a href="${bookmark.url}" target="_blank">${bookmark.title}</a>`;
        container.appendChild(bookmarkEl);
    });
}
