import styled from 'styled-components'

const TerminalDiv = styled.div`
    width:90%;
    white-space: pre-wrap;
`

const TerminalCursor = styled.span`
    animation: blinker 1s step-start infinite;
    background-color: white;
    @keyframes blinker {
    50% {
        background-color: transparent;
    };
}
`

const TextInput = ({baseText,inputSlice1,cursorText,inputSlice2}) => {
    return(<TerminalDiv>{baseText}{inputSlice1}<TerminalCursor>{cursorText}</TerminalCursor>{inputSlice2}</TerminalDiv>)
}

export default TextInput;