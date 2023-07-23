import styled from 'styled-components'

const ImageNoHover= styled.img`
    opacity:100;
    position: fixed;
    top:${props => props.bundle.top};
    left:${props => props.bundle.left};
    height: ${props => props.bundle.height};
`

const ImageHover= styled(ImageNoHover)`
    opacity:0;
    &:hover {
        opacity: 100;
    }
`

const DeskImage = ({bundle}) => {
    return(
        <>
            <ImageNoHover src={bundle.img1} bundle={bundle}/>
            <ImageHover src={bundle.img2} bundle={bundle}/>
        </>
    )
}

export default DeskImage;