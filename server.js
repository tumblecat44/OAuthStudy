// Backend (Express.js)
// server.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

app.get('/mykey', (req,res) =>{
    const response = {
        key: process.env.GITHUB_CLIENT_ID,
    }
    res.json(response);
})

app.post('/api/github/callback', async (req, res) => {
  const { code } = req.body;
  console.log('Received code from frontend:', code);  // 코드 값 로그

  try {
    // GitHub API에 액세스 토큰 요청
    console.log('Requesting access token from GitHub...');
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
      },
      {
        headers: {
          Accept: 'application/json',
        },
      }
    );

    console.log('Received access token response:', tokenResponse.data);  // 액세스 토큰 응답 로그

    const accessToken = tokenResponse.data.access_token;

    if (!accessToken) {
      console.error('Access token not found in response');
      return res.status(500).json({ error: 'Access token not found' });
    }

    // 액세스 토큰으로 사용자 정보 요청
    console.log('Requesting user information from GitHub...');
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    console.log('Received user data:', userResponse.data);  // 사용자 정보 응답 로그

    res.json({ login: userResponse.data.login });
  } catch (error) {
    console.error('Error processing GitHub OAuth:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
