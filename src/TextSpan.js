import styled from 'styled-components'

const TerminalTextSpan = styled.span`
    width:90%;
    white-space: pre-wrap;
`

const TextDiv = ({text}) => {
    return(
        <TerminalTextSpan>{text}</TerminalTextSpan>
    )
}

export default TextDiv;