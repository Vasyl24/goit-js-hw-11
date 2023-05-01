import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import axios from 'axios';

const form = document.querySelector('#search-form');
const input = document.querySelector('input[name="searchQuery"]');
const gallery = document.querySelector('.gallery');
const btnMore = document.querySelector('.load-more');

let PER_PAGE = 40;
let currentPage = 1;
const Q = input.value;

if (!input.value) {
  btnMore.hidden = true;
}

form.addEventListener('submit', evt => {
  evt.preventDefault();
  onSearch();
});

btnMore.addEventListener('click', onLoad);
let lightbox = new SimpleLightbox('.gallery a');

function onLoad() {
  currentPage += 1;

  const a = fetchImg(Q, currentPage)
    .then(data => {
      const totalPages = Math.floor(data.totalHits / PER_PAGE);

      gallery.insertAdjacentHTML('beforeend', getImage(data));
      lightbox.refresh();

      if (currentPage === totalPages) {
        Notify.failure(
          "We're sorry, but you've reached the end of search results."
        );
        btnMore.hidden = true;
      }
      if (data.page === totalPages) {
        btnMore.hidden = true;
      }
    })
    .catch(err => console.log(err));
  return a;
}

async function fetchImg(Q, page = 1) {
  const BASE_URL = 'https://pixabay.com/api';
  const KEY = '35791933-9e16cedd0ba1b691c7138b55a';
  const IMAGE_TYPE = 'photo';
  const ORIENTATION = 'horizontal';
  const SAFESEARCH = 'safesearch';
  const response = await axios.get(
    `${BASE_URL}/?key=${KEY}&q=${input.value}&image_type=${IMAGE_TYPE}&orientation=${ORIENTATION}&safesearch=${SAFESEARCH}&page=${page}&per_page=${PER_PAGE}`
  );
  if (response.status !== 200) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return response.data;
}

function onSearch() {
  const imagesName = input.value.trim();

  const b = fetchImg(imagesName)
    .then(images => {
      // console.log(images);
      if (images.hits.length < PER_PAGE && images.hits.length > 0) {
        Notify.info(`"Hooray! We found ${images.totalHits} images."`);

        btnMore.hidden = true;
      } else if (images.hits.length) {
        Notify.info(`"Hooray! We found ${images.totalHits} images."`);

        setTimeout(() => {
          btnMore.hidden = false;
        }, 600);
      } else if (!images.hits.length) {
        Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );

        btnMore.hidden = true;
      }
      gallery.innerHTML = '';
      gallery.insertAdjacentHTML('beforeend', getImage(images));
      lightbox.refresh();
    })
    .catch(err => {
      console.log(err);
    });
  return b;
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
