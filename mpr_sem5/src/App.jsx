
import {BrowserRouter as Router,Route,Routes} from 'react-router-dom'
import Chatbot_Page from './pages/Chatbot_Page'
import Info from './pages/Info'


function App() {

  return (
    <Router>
      <Routes>
      <Route path='/' element={<Chatbot_Page/>}/>
      <Route path='/info' element={<Info/>}/>
      </Routes>
    </Router>
  )
}

export default App
