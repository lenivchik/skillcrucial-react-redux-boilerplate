import express from 'express'
import path from 'path'
import cors from 'cors'
import bodyParser from 'body-parser'
import sockjs from 'sockjs'
import { renderToStaticNodeStream } from 'react-dom/server'
import React from 'react'
import axios from 'axios' 
import cookieParser from 'cookie-parser'
import config from './config'
import Html from '../client/html'

const Root = () => ''

try {
  // eslint-disable-next-line import/no-unresolved
  // ;(async () => {
  //   const items = await import('../dist/assets/js/root.bundle')
  //   console.log(JSON.stringify(items))

  //   Root = (props) => <items.Root {...props} />
  //   console.log(JSON.stringify(items.Root))
  // })()
  console.log(Root)
} catch (ex) {
  console.log(' run yarn build:prod to enable ssr')
}

let connections = []

const port = process.env.PORT || 8090
const server = express()
const { readFile, writeFile ,unlink} = require('fs').promises;

const Headers = (req, res, next) =>{
  res.set('x-skillcrucial-user', '880c92c6-3cf5-45bd-9160-7524a11ec7cb')  
  res.set('Access-Control-Expose-Headers', 'X-SKILLCRUCIAL-USER')
  next() 
}

const middleware = [
  cors(),
  express.static(path.resolve(__dirname, '../dist/assets')),
  bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }),
  bodyParser.json({ limit: '50mb', extended: true }),
  cookieParser(),
  Headers
]

middleware.forEach((it) => server.use(it))

async function ReadFile() {
  return readFile(`${__dirname}/test.json`, { encoding: "utf8" })  
  .then((text) => {  
    return JSON.parse(text)
  })  
  .catch(async() => {  
    const text = await axios("https://jsonplaceholder.typicode.com/users").then((result)=> result.data)
    await writeFile(`${__dirname}/test.json`, JSON.stringify(text), { encoding: "utf8" });  
    return text
  })  
}

server.get('/api/v1/users', async (req, res) => {
  res.json(await ReadFile())  
})  

server.post('/api/v1/users', async (req, res) => {
  const info = req.body
  const obj = await ReadFile()
  info.id = obj[obj.length - 1].id + 1
  await writeFile(`${__dirname}/test.json`, JSON.stringify([...obj,info]), { encoding: "utf8" });  
  res.json({ status: 'success', id: info.id })  
})  

server.patch('/api/v1/users/:userId', async (req, res) => {
  const {userId} = req.params
  const info = req.body
  const arr = await ReadFile()
  await writeFile(`${__dirname}/test.json`, JSON.stringify(arr.map((it) => it.id === +userId ? {...it, ...info} : it)), { encoding: "utf8" });  
  res.json({ status: 'success', id: info.id })  
})  

server.delete('/api/v1/users/:userId', async (req, res) => {
  const {userId} = req.params
  const arr = await ReadFile()
  await writeFile(`${__dirname}/test.json`, JSON.stringify(arr.filter((it) => it.id !== +userId)), { encoding: "utf8" });  
  res.json({ status: 'success', id: +userId })  
})  

server.delete('/api/v1/users', async (req, res) => {
  await unlink(`${__dirname}/test.json`)
  res.json({ status: 'successs'})
}) 



server.use('/api/', (req, res) => {
  res.status(404)
  res.end()
})


const [htmlStart, htmlEnd] = Html({
  body: 'separator',
  title: 'Skillcrucial - Become an IT HERO'
}).split('separator')

server.get('/', (req, res) => {
  const appStream = renderToStaticNodeStream(<Root location={req.url} context={{}} />)
  res.write(htmlStart)
  appStream.pipe(res, { end: false })
  appStream.on('end', () => {
    res.write(htmlEnd)
    res.end()
  })
})

server.get('/*', (req, res) => {
  const initialState = {
    location: req.url
  }

  return res.send(
    Html({
      body: '',
      initialState
    })
  )
})

const app = server.listen(port)

if (config.isSocketsEnabled) {
  const echo = sockjs.createServer()
  echo.on('connection', (conn) => {
    connections.push(conn)
    conn.on('data', async () => {})

    conn.on('close', () => {
      connections = connections.filter((c) => c.readyState !== 3)
    })
  })
  echo.installHandlers(app, { prefix: '/ws' })
}
console.log(`Serving at http://localhost:${port}`)
