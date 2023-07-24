import styled from 'styled-components'

const TerminalDiv = styled.div`
    width:90%;
    white-space: pre-wrap;
`

const TextDiv = ({text}) => {
    return(
        <TerminalDiv>{text}</TerminalDiv>
    )
}

export default TextDiv;