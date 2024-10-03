
import {BrowserRouter as Router,Route,Routes} from 'react-router-dom'
import Chatbot_Page from './pages/Chatbot_Page'
import Info from './pages/Info'
import Upload from './pages/Upload'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'

function App() {

  return (
    <Router>
        <Navbar/>
      <Routes>
      <Route path='/chatbot' element={<Chatbot_Page/>}/>
      <Route path='/info' element={<Info/>}/>
      <Route path='/upload' element={<Upload/>}/>
      <Route path='/' element={<Home/>}/>
      </Routes>
      <Footer/>
    </Router>
  )
}

export default App
