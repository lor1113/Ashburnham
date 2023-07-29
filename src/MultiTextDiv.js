import styled from 'styled-components'

const MultiTerminalSpan = styled.span`
    white-space: pre-wrap;
`

const MultiContainerDiv = styled.div`
    width: 95%;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-evenly;
`

const MultiTextDiv = ({text}) => {
    const textDivs = text.map((x,a) => <MultiTerminalSpan key={a}>{x}</MultiTerminalSpan>)
    return(
        <MultiContainerDiv>{textDivs}</MultiContainerDiv>
    )
}

export default MultiTextDiv;