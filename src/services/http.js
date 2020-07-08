import axios from 'axios'

if (process.env.API_SERVER)
  var apiServer = process.env.API_SERVER
else
  var apiServer = 'https://aqueous-brushlands-76849.herokuapp.com'

const client = axios.create({
  baseURL: apiServer,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  }
})

export default client
