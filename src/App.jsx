import { Provider } from 'react-redux'
import './App.css'
import store from './redux/store'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Router from './routes/Router'

function App() {

  return (
    <Provider store={store}>
      <BrowserRouter>
        <Router />
      </BrowserRouter>
      <Toaster position="top-right" />
    </Provider>
  )
}

export default App
