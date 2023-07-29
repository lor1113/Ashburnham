import React, { useEffect } from 'react';

const imageInputDestroyer = (event) => {
    const isPrintableKey = event.key.length === 1 || event.key === 'Unidentified';
    console.log(isPrintableKey)
    if (isPrintableKey) {
        event.preventDefault()
        event.stopPropagation()
    }
}

const imageClose = {type:"closeImage", action:"0", data:"0"}

const ImageDisplay = ({image, dispatch}) => {

    useEffect(() => {
        console.log("added listener")
        document.addEventListener("keydown",imageInputDestroyer,true)
        return () => {
            console.log("removed listener")
            document.removeEventListener("keydown",imageInputDestroyer,true)
            };
    },[])

    return(
        <div className='fullScreen'>
            <div className='imageContainer'>
                <div className='imageHeader'>
                    <span>{image[1]}</span>
                    <button className='imageButton' onClick={() => dispatch(imageClose)}>
                        x
                    </button>
                </div>
                <img className='image' src={image[0]} alt={image[2]}/>
            </div>
        </div>
    )
}

export default ImageDisplay