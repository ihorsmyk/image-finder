import { useState, useEffect } from 'react';
import { FETCH_STATUS } from '../constants/fetchStatus';
import { getPictures } from 'services/pictures.service';
import { Searchbar } from './Searchbar/Searchbar';
import ImageGallery from './ImageGallery/ImageGallery';
import Button from './Button/Button';
import { Loader } from './Loader/Loader';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

export const App = () => {
  const [pictures, setPictures] = useState([]);
  const [request, setRequest] = useState('');
  const [page, setPage] = useState(1);
  const [totalHits, setTotalHits] = useState(FETCH_STATUS.Empty);
  const [status, setStatus] = useState(FETCH_STATUS.Empty);

  //prepare to make request
  const prepareMakeRequest = word => {
    setPictures([]);
    setRequest(word.toLowerCase().trim());
    setPage(1);
    setTotalHits(FETCH_STATUS.Empty);
    setStatus(FETCH_STATUS.Empty);
  };

  useEffect(() => {
    makeRequest();
  }, [request, page]);

  // const componentDidUpdate = (_, prevState) => {
  //   makeRequest(prevState);
  // };

  const setRequestWord = word => {
    if (word === '') {
      Notify.info('The input field is empty!');
    } else if (word !== request) {
      prepareMakeRequest(word);
    }
  };

  const makeRequest = async () => {
    // if (prevState.request !== request || prevState.page !== page) {
      setStatus(FETCH_STATUS.Loading);
      try {
        const receivedPictures = await getPictures(request, page);
        setTotalHits(receivedPictures.totalHits);

        if (receivedPictures.totalHits === 0) {
          Notify.warning(`No results for ${request}`);
        }
        //copy only the required properties
        const pictures = receivedPictures.hits.map(
          ({ id, webformatURL, largeImageURL, tags }) => {
            return { id, webformatURL, largeImageURL, tags };
          }
        );
        setPictures(prevPictures => ({
          pictures: [...prevPictures, ...pictures],
        }));
        setStatus(FETCH_STATUS.Success);
      } catch (error) {
        setStatus(FETCH_STATUS.Error);
        console.log(error.message);
        Notify.failure('Something went wrong!');
      }
    }
  };

  const handleChangePage = () => {
    setPage(prevPage => prevPage + 1);
  };

  return (
    <>
      <Searchbar search={setRequestWord} />

      {status === FETCH_STATUS.Loading && <Loader />}

      <ImageGallery imageList={pictures} />

      {pictures.length < totalHits && <Button loadMore={handleChangePage} />}
    </>
  );
};
