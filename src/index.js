import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const form = document.querySelector('#search-form');
const input = document.querySelector('input[name="searchQuery"]');
const gallery = document.querySelector('.gallery');
const btnMore = document.querySelector('.load-more');

let PER_PAGE = 40;
let currentPage = 1;
if (!input.value) {
  btnMore.hidden = true;
}

form.addEventListener('submit', evt => {
  evt.preventDefault();
  onSearch();
});

// const target = document.querySelector('.js-guard');
// let options = {
//   root: null,
//   rootMargin: '300px',
//   threshold: 1.0,
// };

// let observer = new IntersectionObserver(onScroll, options);

// function onScroll(){}

btnMore.addEventListener('click', onLoad);
let lightbox = new SimpleLightbox('.gallery a');

async function onLoad() {
  currentPage += 1;

  const a = await fetchImg(currentPage)
    .then(data => {
      const totalPages = Math.round(data.totalHits / PER_PAGE);

      gallery.insertAdjacentHTML('beforeend', getImage(data));
      lightbox.refresh();
      //   console.log(totalPages);
      //   console.log('CurrentPage', currentPage);
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

async function fetchImg(page = 1) {
  const BASE_URL = 'https://pixabay.com/api';
  const KEY = '35791933-9e16cedd0ba1b691c7138b55a';
  const Q = input.value;
  const IMAGE_TYPE = 'photo';
  const ORIENTATION = 'horizontal';
  const SAFESEARCH = 'safesearch';

  const url = await fetch(
    `${BASE_URL}/?key=${KEY}&q=${Q}&image_type=${IMAGE_TYPE}&orientation=${ORIENTATION}&safesearch=${SAFESEARCH}&page=${page}&per_page=${PER_PAGE}`
  ).then(response => {
    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return response.json();
  });
  return url;
}

async function onSearch() {
  const imagesName = input.value.trim();

  const b = await fetchImg(imagesName)
    .then(images => {
      if (images.hits.length) {
        Notify.info(`"Hooray! We found ${images.totalHits} images."`);

        setTimeout(() => {
          btnMore.hidden = false;
        }, 600);
      } else {
        // Notify.failure(
        //   'Sorry, there are no images matching your search query. Please try again.'
        // );

        btnMore.hidden = true;
      }

      gallery.innerHTML = '';
      gallery.insertAdjacentHTML('beforeend', getImage(images));
      lightbox.refresh();
    })
    .catch(err => console.log(err));
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
