import styled from 'styled-components'
import main_background from './img/main_background.png'
import DeskImage from './DeskImage'
import book_hover from './img/book_hover.png'
import book from './img/book.png'

const MainBG = styled.div`
  background-image: url(${main_background});
  background-repeat: no-repeat;
  background-size: 100% 100%;
  width: 100vw;
  height: 100vh;
`

const testParams = {
  'img1': book,
  'img2': book_hover,
  'height': "20vh",
  'top': "5vh",
  'left': "5vw"
}


function App() {
  return (
    <MainBG>
      <DeskImage bundle={testParams}/>
    </MainBG>
  );
}

export default App;
