import React, { useContext, useState } from 'react';
import { useRouter } from 'next/router';
import FileUploader from 'react-firebase-file-uploader';
import { css } from '@emotion/core';
import styled from '@emotion/styled';
import Layout from '../components/layout/Layout';
import Error404 from '../components/layout/404';
import { Form, Field, Submit, Error } from '../components/ui/Form';
import useValidate from '../hooks/useValidate';
import validateChallenge from '../validation/validateChallenge';
import { FirebaseContext } from '../firebase';

const Container = styled.div`
  @media (min-width: 1024px) {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
  fieldset {
    min-width: 90%;
  }
`;

const Button = styled.label`
  background-color: var(--orange);
  color: white;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  width: 75%;
  max-width: 300px;
  text-align: center;
  margin: 0 auto 2rem;
`;

const NewChallenge = () => {
  const { user, firebase } = useContext(FirebaseContext);
  const [error, setError] = useState(null);
  const [imgURL, setImgURL] = useState('');
  const router = useRouter();
  const INITIAL_STATE = {
    source: '',
    link: '',
    name: '',
    description: '',
    explanation: '',
  };
  const { values, handleChange, handleSubmit, handleBlur } = useValidate(
    INITIAL_STATE,
    validateChallenge,
    newChallenge
  );
  const { source, link, name, description, explanation } = values;
  async function newChallenge() {
    if (!user) return router.push('/login');
    const { displayName, uid } = user;
    const challenge = {
      source,
      link,
      name,
      description,
      imgURL,
      explanation,
      votes: [],
      numVotes: 0,
      comments: [],
      published: Date.now(),
      creator: { displayName, uid },
    };
    try {
      firebase.db.collection('challenges').add(challenge);
      return router.push('/');
    } catch ({ message }) {
      console.error('Challenge could not be created', message);
      setError(message);
    }
  }
  const handleUploadError = error => {
    setError(error.message);
    console.error(error);
  };
  const handleUploadSuccess = name =>
    firebase.storage
      .ref('challenges')
      .child(name)
      .getDownloadURL()
      .then(url => setImgURL(url));
  return !user ? (
    <Error404 />
  ) : (
    <div>
      <Layout>
        <div className='container'>
          <h1
            css={css`
              text-align: center;
              margin-top: 5rem;
            `}>
            Upload New Challenge
          </h1>
          <Form onSubmit={handleSubmit}>
            <Container>
              <fieldset>
                <legend>General Information</legend>
                <Field>
                  <label htmlFor='name'>Name</label>
                  <input
                    type='text'
                    id='name'
                    placeholder='Challenge name'
                    name='name'
                    value={name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                  />
                </Field>
                <Field>
                  <label htmlFor='source'>Source</label>
                  <input
                    type='text'
                    id='source'
                    placeholder='Name of host website'
                    name='source'
                    value={source}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                  />
                </Field>
                <Field>
                  <label htmlFor='link'>Link</label>
                  <input
                    type='url'
                    id='link'
                    name='link'
                    placeholder='URL of this challenge'
                    value={link}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                  />
                </Field>
                <Field>
                  <label htmlFor='description'>Description</label>
                  <textarea
                    id='description'
                    name='description'
                    value={description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder='Description of the challenge'
                    required
                  />
                </Field>
              </fieldset>
              <fieldset>
                <legend>Your Solution</legend>
                <Field>
                  <Button className='btn'>
                    Upload a Screenshot
                    <FileUploader
                      hidden
                      accept='image/*'
                      id='screenshot'
                      randomizeFilename
                      storageRef={firebase.storage.ref('challenges')}
                      onUploadError={handleUploadError}
                      onUploadSuccess={handleUploadSuccess}
                      required
                    />
                  </Button>
                </Field>
                <Field>
                  <label htmlFor='explanation'>Explanation</label>
                  <textarea
                    id='explanation'
                    name='explanation'
                    value={explanation}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder='Explain your thought process'
                    required
                  />
                </Field>
                <p>Upload a screenshot of your code</p>
              </fieldset>
            </Container>
            {error && <Error>{error}</Error>}
            <Submit type='submit' value='Publish Challenge' />
          </Form>
        </div>
      </Layout>
    </div>
  );
};

export default NewChallenge;
