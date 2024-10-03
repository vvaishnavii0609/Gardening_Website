
import {BrowserRouter as Router,Route,Routes} from 'react-router-dom'
import Chatbot_Page from './pages/Chatbot_Page'
import Info from './pages/Info'
import Upload from './pages/Upload'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

function App() {

  return (
    <Router>
        <Navbar/>
      <Routes>
      <Route path='/' element={<Chatbot_Page/>}/>
      <Route path='/info' element={<Info/>}/>
      <Route path='/upload' element={<Upload/>}/>
      </Routes>
      <Footer/>
    </Router>
  )
}

export default App
