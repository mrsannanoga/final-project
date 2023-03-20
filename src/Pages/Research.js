import React, { useState, useEffect } from 'react';
import styled from "styled-components";
import BookSearchCard from "../Components/BookSearchCard";

// Import the necessary components
import { Button } from 'react-bootstrap';

// Define the placeholder image
const placeholderImage = 'https://via.placeholder.com/150';

const InputGroup = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  flex-wrap: nowrap;
`;

const FormControl = styled.input`
  padding: 0.5rem 1rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1.5rem;
`;

const ClearButton = styled(Button)`
  background-color: #7C3238;
  color: white;
  font-size: 1.5rem;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  border: none;
  cursor: pointer;
`;

const SearchButton = styled(Button)`
  background-color: #B4A29E;
  color: white;
  font-size: 1.5rem;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  border: none;
  cursor: pointer;
`;
const BrowseButton = styled(Button)`
  background-color: #6c757d;
  color: white;
  font-size: 1.5rem;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  border: none;
  cursor: pointer;

  /* Add the target="_blank" attribute */
  a {
    color: white;
    text-decoration: none;
  }
`;
const ResultsContainer = styled.div`
display: flex;
flex-wrap: wrap;
justify-content: center;
gap: 1rem;
margin-top: 4rem;
${({ hoveredBookId }) =>
    hoveredBookId &&
    `> *:not([data-id="${hoveredBookId}"]) {
    filter: blur(0px);
  }`
  };
`;

const Research = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [covers, setCovers] = useState([]);
  const [hoveredBookId, setHoveredBookId] = useState(null);
  const [coversUrl, setCoverUrls] = useState({});

  useEffect(() => {
    // Retrieve saved results from local storage
    const savedResults = JSON.parse(localStorage.getItem('results'));
    if (savedResults && savedResults.length > 0) {
      setResults(savedResults);
    }

    // Retrieve saved cover URLs from local storage
    const savedCoverUrls = JSON.parse(localStorage.getItem('coverUrls'));
    if (savedCoverUrls) {
      setCoverUrls(savedCoverUrls);
      const coverIds = Object.keys(savedCoverUrls);
      const covers = coverIds.reduce((obj, id) => ({ ...obj, [id]: savedCoverUrls[id] }), {});
      setCovers(covers);
    }
  }, []);

  useEffect(() => {
    // Save results to local storage whenever the results state variable changes
    localStorage.setItem('results', JSON.stringify(results));
  }, [results]);

  const handleBrowse = () => {
    window.open('https://openlibrary.org/', '_blank');
  };


  const handleSearch = async () => {
    const url = `https://openlibrary.org/subjects/${encodeURIComponent(query)}.json?details=true`;
    const response = await fetch(url);
    const data = await response.json();
    // Extract the array of works from the response
    const works = data.works || [];
    setResults(works);

    // Fetch cover images for each work and store them in the covers state variable
    const coverIds = works
      .map(work => work.cover_id)
      .filter(id => id !== undefined);
    const coverUrl = 'https://covers.openlibrary.org/b/id/{id}-M.jpg';
    const coverPromises = coverIds.map(id => fetch(coverUrl.replace('{id}', id)));
    const responses = await Promise.all(coverPromises);
    const blobs = await Promise.all(responses.map(response => response.blob()));
    const urls = blobs.map(blob => URL.createObjectURL(blob));
    const covers = coverIds.reduce((obj, id, index) => ({ ...obj, [id]: urls[index] }), {});
    setCovers(covers);
    setCoverUrls(covers);
    localStorage.setItem('coverUrls', JSON.stringify(covers));
  };

  const isBookInList = (id) => {
    return false;
  };

  const handleSave = (book) => {
    console.log(book);
  };

  return (
    <div>
      <InputGroup>
        <FormControl
          type="text"
          placeholder="Search books"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <SearchButton onClick={handleSearch}>Search</SearchButton>
        <ClearButton variant="secondary" onClick={() => setResults([])}>Clear</ClearButton>
        <BrowseButton onClick={handleBrowse}>Visit Open Library</BrowseButton>
      </InputGroup>



      {results.length > 0 && (
        <>
          <ResultsContainer hoveredBookId={hoveredBookId}>
            {results.map((result) => {
              const bookId = result.cover_edition_key || result.key;

              const book = {
                id: bookId,
                volumeInfo: {
                  title: result.title,
                  authors: result.authors || [],
                  imageLinks: {

                    thumbnail: covers[result.cover_id] || placeholderImage,
                  },
                },
              };
              return (
                <BookSearchCard
                  key={book.id}
                  book={book}
                  handleSave={handleSave}
                  setHoveredBookId={setHoveredBookId}
                  isBookInList={isBookInList}
                />
              );
            })}
          </ResultsContainer>
        </>
      )}
    </div>
  );
};
export default Research;

