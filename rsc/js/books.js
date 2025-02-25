// js/books.js

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded, starting book fetch process.');
    fetchBooks();
});
  
async function fetchBooks() {
    console.log('Fetching books from ./rsc/json/books.json');
    try {
      const response = await fetch('./rsc/json/books.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const books = await response.json();
      console.log('Books fetched successfully:', books);
      displayBooks(books);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
}
  
function createBookElement(book) {
    const bookDiv = document.createElement('div');
    bookDiv.classList.add('book');
  
    const coverImg = document.createElement('img');
    coverImg.src = book.cover;
    coverImg.alt = `${book.title} cover`;
    coverImg.classList.add('book-cover');
  
    const title = document.createElement('h3');
    title.textContent = book.title;
  
    const author = document.createElement('p');
    author.textContent = `by ${book.author}`;
  
    const description = document.createElement('p');
    description.textContent = book.description;
  
    bookDiv.appendChild(coverImg);
    bookDiv.appendChild(title);
    bookDiv.appendChild(author);
    bookDiv.appendChild(description);
  
    return bookDiv;
}
  
function displayBooks(books) {
  const container = document.getElementById('booksContainer');
  container.innerHTML = ''; // Clear any existing content
  
  books.forEach(book => {
    const bookEl = createBookElement(book);
    container.appendChild(bookEl);
  });
}


