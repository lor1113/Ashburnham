import styled from 'styled-components'

const MultiTerminalSpan = styled.span`
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
    const dirTextDivs = childDirectories.map(x => <MultiTerminalSpan key={x} onClick={() => handleListClick(x,true)}>{"/" + x}</MultiTerminalSpan>)
    const fileTextDivs = childFiles.map(x => <MultiTerminalSpan key={x} onClick={() => handleListClick(x,false)}>{x}</MultiTerminalSpan>)
    const textDivs = dirTextDivs.concat(fileTextDivs)
    return(
        <MultiContainerDiv>{textDivs}</MultiContainerDiv>
    )
}

export default ListDiv;