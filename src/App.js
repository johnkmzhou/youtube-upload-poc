import React, { useState, useRef } from 'react';
import { FirebaseAuth } from 'react-firebaseui';
import firebase from 'firebase/app';
import 'firebase/auth'
import { MediaUploader } from './cors_upload';

const config = {
  apiKey: "AIzaSyA9wVUprRRPNyaWX8L4ryaiu32Hs2g2ByI",
  authDomain: "upload-poc-bdf60.firebaseapp.com",
}

firebase.initializeApp(config);

function App() {
  const [title, setTitle] = useState("");
  const [signedIn, setSignedIn] = useState(false);
  const [accessToken, setAccessToken] = useState();
  const [percentageComplete, setPercentageComplete] = useState(0);
  const [uploadResponse, setUploadResponse] = useState();
  const fileRef = useRef();

  const uiConfig = {
    signInFlow: 'redirect',
    signInOptions: [{
      provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      scopes: [
        'https://www.googleapis.com/auth/youtube.upload'
      ]
    }
    ],
    callbacks: {
      signInSuccessWithAuthResult: authResult => {
        console.log(authResult);
        setAccessToken(authResult.credential.accessToken);
        setSignedIn(true);
      }
    }
  };

  const onSubmit = async event => {
    try {
      event.preventDefault();
      const file = fileRef.current.files[0];

      const metadata = {
        snippet: {
          title: title,
        },
        status: {
          privacyStatus: 'unlisted'
        }
      }

      const uploader = new MediaUploader({
        baseUrl: 'https://www.googleapis.com/upload/youtube/v3/videos',
        file: file,
        token: accessToken,
        metadata: metadata,
        params: {
          part: Object.keys(metadata).join(',')
        },
        onError: (data) => {
          setUploadResponse(data);
        },
        onProgress: (data) => {
          var bytesUploaded = data.loaded;
          var totalBytes = data.total;
          setPercentageComplete((bytesUploaded * 100) / totalBytes);
        },
        onComplete: (data) => {
          setUploadResponse(data);
        }
      })

      uploader.upload();
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="App">
      {signedIn ? <>
        <h1>My App</h1>
        <p>Welcome! You are now signed-in!</p>
        <form onSubmit={onSubmit}>
          <input name="title" type="text" placeholder="Title" value={title} onChange={event => setTitle(event.target.value)} />
          <input name="file" type="file" accept="video/mp4" ref={fileRef} />
          <button type="submit">Submit</button>
        </form>
        <p>
          {percentageComplete}{"% uploaded"}
        </p>
        {uploadResponse}
      </> : <>
          <h1>Youtube Upload Proof of Concept</h1>
          <p>Please sign-in:</p>
          <FirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />
        </>}
    </div>
  );
}

export default App;
