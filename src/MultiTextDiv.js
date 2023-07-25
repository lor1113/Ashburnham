import styled from 'styled-components'

const TerminalDiv = styled.div`
    white-space: pre-wrap;
`

const MultiContainerDiv = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: space-evenly;
`

const MultiTextDiv = ({text}) => {
    const textDivs = text.map((x,a) => <TerminalDiv key={a}>{x}</TerminalDiv>)
    return(
        <MultiContainerDiv>{textDivs}</MultiContainerDiv>
    )
}

export default MultiTextDiv;