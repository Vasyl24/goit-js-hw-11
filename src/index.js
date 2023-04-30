import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const form = document.querySelector('#search-form');
const input = document.querySelector('input[name="searchQuery"]');
const gallery = document.querySelector('.gallery');
const btnMore = document.querySelector('.load-more');

let PER_PAGE = 40;
let currentPage = 1;
const totalPages = gallery.totalHits / PER_PAGE;

if (!input.value) {
  btnMore.hidden = true;
}

form.addEventListener('submit', evt => {
  evt.preventDefault();
  onSearch();
});
new SimpleLightbox('.gallery a');

btnMore.addEventListener('click', onLoad);

function onLoad() {
  if (gallery.totalHits === totalPages * PER_PAGE) {
    Notify.info("We're sorry, but you've reached the end of search results.");
  } else {
    currentPage += 1;

    fetchImg(currentPage)
      .then(data => {
        gallery.insertAdjacentHTML('beforeend', getImage(data));

        if (data.page === totalPages) {
          btnMore.hidden = true;
        }
      })
      .catch(err => console.log(err));
  }
}

function fetchImg(page = 1) {
  const BASE_URL = 'https://pixabay.com/api';
  const KEY = '35791933-9e16cedd0ba1b691c7138b55a';
  const Q = input.value;
  const IMAGE_TYPE = 'photo';
  const ORIENTATION = 'horizontal';
  const SAFESEARCH = 'safesearch';

  return fetch(
    `${BASE_URL}/?key=${KEY}&q=${Q}&image_type=${IMAGE_TYPE}&orientation=${ORIENTATION}&safesearch=${SAFESEARCH}&page=${page}&per_page=${PER_PAGE}`
  ).then(response => {
    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return response.json();
  });
}

function onSearch() {
  const imagesName = input.value.trim();

  if (input.value) {
    fetchImg(imagesName)
      .then(images => {
        gallery.innerHTML = '';
        gallery.insertAdjacentHTML('beforeend', getImage(images));
      })
      .catch(err => console.log(err));

    setTimeout(() => {
      btnMore.hidden = false;
    }, 500);
  } else {
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }
}
function getImage(images) {
  return images.hits
    .map(
      ({
        webformatURL,
        tags,
        likes,
        views,
        comments,
        downloads,
        largeImageURL,
      }) =>
        `<div class="photo-card">
                    <a class="gallery__link" href="${largeImageURL}">
                    <img src="${webformatURL}" alt="${tags}" class="img-card gallery__image" width="400" height="250" loading="lazy" />
                    <div class="info">
                     <p class="info-item">
                         <b>Likes <span class="num-of-items">${likes}</span></b>
                     </p>
                     <p class="info-item">
                        <b>Views <span class="num-of-items">${views}</span></b>
                     </p>
                    <p class="info-item">
                        <b>Comments <span class="num-of-items">${comments}</span></b>
                    </p>
                    <p class="info-item">
                        <b>Downloads <span class="num-of-items">${downloads}</span></b>
                    </p>
                     </div>
                    </a>
                    </div>`
    )
    .join('');
}
