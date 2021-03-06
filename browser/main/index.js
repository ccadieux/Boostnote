import { Provider } from 'react-redux'
import Main from './Main'
import store from './store'
import React from 'react'
import ReactDOM from 'react-dom'
require('!!style!css!stylus?sourceMap!./global.styl')
import activityRecord from 'browser/lib/activityRecord'
import { Router, Route, IndexRoute, IndexRedirect, hashHistory } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'

const electron = require('electron')
const ipc = electron.ipcRenderer
const path = require('path')
const remote = electron.remote

if (process.env.NODE_ENV !== 'production') {
  window.addEventListener('keydown', function (e) {
    if (e.keyCode === 73 && e.metaKey && e.altKey) {
      remote.getCurrentWindow().toggleDevTools()
    }
  })
}

activityRecord.init()
window.addEventListener('online', function () {
  ipc.send('check-update', 'check-update')
})

document.addEventListener('drop', function (e) {
  e.preventDefault()
  e.stopPropagation()
})
document.addEventListener('dragover', function (e) {
  e.preventDefault()
  e.stopPropagation()
})

function notify (title, options) {
  if (process.platform === 'win32') {
    options.icon = path.join('file://', global.__dirname, '../../resources/app.png')
    options.silent = false
  }
  console.log(options)
  return new window.Notification(title, options)
}

ipc.on('notify', function (e, payload) {
  notify(payload.title, {
    body: payload.body
  })
})

ipc.on('copy-finder', function () {
  activityRecord.emit('FINDER_COPY')
})
ipc.on('open-finder', function () {
  activityRecord.emit('FINDER_OPEN')
})

let el = document.getElementById('content')
const history = syncHistoryWithStore(hashHistory, store)

ReactDOM.render((
  <Provider store={store}>
    <Router history={history}>
      <Route path='/' component={Main}>
        <IndexRedirect to='/home'/>
        <Route path='home'/>
        <Route path='starred'/>
        <Route path='storages'>
          <IndexRedirect to='/home'/>
          <Route path=':storageKey'>
            <IndexRoute/>
            <Route path='folders/:folderKey'/>
          </Route>
        </Route>
      </Route>
    </Router>
  </Provider>
), el, function () {
  let loadingCover = document.getElementById('loadingCover')
  loadingCover.parentNode.removeChild(loadingCover)
})
