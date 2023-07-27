import styled from 'styled-components'

const TerminalDiv = styled.div`
    white-space: pre-wrap;
    &:hover{
        background-color:white;
        color:black;
    }
`

const MultiContainerDiv = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: space-evenly;
    width: 95%;
`

const ListDiv = ({childDirectories, childFiles, handleListClick}) => {
    const dirTextDivs = childDirectories.map(x => <TerminalDiv key={x} onClick={() => handleListClick(x,true)}>{"/" + x}</TerminalDiv>)
    const fileTextDivs = childFiles.map(x => <TerminalDiv key={x} onClick={() => handleListClick(x,false)}>{x}</TerminalDiv>)
    const textDivs = dirTextDivs.concat(fileTextDivs)
    return(
        <MultiContainerDiv>{textDivs}</MultiContainerDiv>
    )
}

export default ListDiv;