import styled from 'styled-components'

const TerminalSpan = styled.span`
    width:95%;
    white-space: pre-wrap;
`

const TextInput = ({baseText,inputSlice1,cursorText,inputSlice2, cursorFlash}) => {
    return(<TerminalSpan>{baseText}{inputSlice1}<span className={(cursorFlash ? "cursorBlink":"cursorNoBlink")}>{cursorText}</span>{inputSlice2}</TerminalSpan>)
}

export default TextInput;