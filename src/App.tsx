import { RecoilRoot } from 'recoil'
import { BrowserRouter } from 'react-router-dom'
import './App.css'
import Routing from './Routing'

function App() {

  return (
    <RecoilRoot>
      <BrowserRouter basename='htmlboy'>
        <Routing/>
      </BrowserRouter>
    </RecoilRoot>
  )
}

export default App
