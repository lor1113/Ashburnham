import styled from 'styled-components'
import React, { useState, useEffect, useCallback, useRef } from 'react';

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

const stringMatcher = (inputString,toMatch) => {
    inputString = inputString.toLowerCase()
    const stringLength = inputString.length
    const output = toMatch.find(x => x.slice(0,stringLength).toLowerCase() === inputString)
    return output
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


const TextInput = ({workingDirectory,childItems,executeCommand,autoCommand}) => {
    const baseText = "lorenzocurcio " + workingDirectory + " > "

    const [textSlice1, setTextSlice1] = useState("");
    const [textSlice2, setTextSlice2] = useState("");
    const [cursorText, setCursorText] = useState("\u00A0")

    const autoRef = useRef(true)

    let inputSlice1 = ""
    let inputSlice2 = ""
    let cursorChar = ""
    let cursorPos = 0
    let fullText = ""

    const setTextContent = (text) => {
        fullText = text
        if (cursorPos === 0) {
            inputSlice1 = text
            inputSlice2 = ""
            cursorChar = ""
            setTextSlice1(inputSlice1)
            setTextSlice2("")
            setCursorText("\u00A0")
        } else {
            const cursorIndex = cursorPos + text.length
            cursorChar = text[cursorIndex]
            inputSlice1 = text.slice(0,cursorIndex)
            inputSlice2 = text.slice(cursorIndex + 1)
            setCursorText(cursorChar)
            setTextSlice1(inputSlice1)
            setTextSlice2(inputSlice2)
        }
        document.body.scrollTo(0,document.body.scrollHeight)
    }

    const handleKeyDown = useCallback((event) => {
        let newText = ""
        let isPrintableKey = event.key.length === 1 || event.key === 'Unidentified';
        if (isPrintableKey) {
            newText = inputSlice1 + event.key + cursorChar + inputSlice2
            setTextContent(newText)
        } else if (event.keyCode === 8 || event.keyCode === 46) {
            if (fullText.length > 0){
                newText = inputSlice1.slice(0,-1) + cursorChar + inputSlice2
                setTextContent(newText)
            }
        } else if (event.keyCode === 13){
            if (fullText.length > 0){
                cursorPos = 0
                executeCommand(fullText)
                setTextContent("")                
            }
        } else if (event.keyCode === 37) {
            if ((cursorPos + fullText.length) > 0) {
                cursorPos -= 1
                setTextContent(fullText)
            }
        } else if (event.keyCode === 39){
            if (cursorPos < 0){
                cursorPos += 1
                setTextContent(fullText)
            }
        } else if (event.keyCode === 9){
            event.preventDefault()
            if (fullText.length > 0){
                if (fullText.includes(" ")){
                    const commandSeparator = fullText.indexOf(" ")
                    const currentCommand = fullText.slice(0,commandSeparator)
                    const currentArgs = fullText.slice(commandSeparator + 1)
                    if (currentArgs.length > 0){
                        const match = stringMatcher(currentArgs,childItems)
                        if (match) {
                            newText = currentCommand + " " + match
                            cursorPos = 0
                            setTextContent(newText)
                        }
                    }
                }
            }
        }   
    }, [childItems])

    useEffect(() => {
        console.log("added listener")
        document.addEventListener("keydown",handleKeyDown)
        return () => {
            console.log("removed listener")
            document.removeEventListener("keydown",handleKeyDown)
          };
    },[handleKeyDown])

    useEffect(() => {
        async function runAutoCommand(autoCommand) {
            if (autoCommand) {
                console.log("running auto command")
                document.addEventListener("keydown",inputDestroyer,true)
                cursorPos = 0
                setTextContent("")
                await sleep(200)
                for (let x = 0; x < autoCommand.length; x++) {
                    const newText = fullText + autoCommand[x]
                    setTextContent(newText)
                    await sleep(200)
                }
                await sleep(300)
                executeCommand(fullText)
                setTextContent("")         
                document.removeEventListener("keydown",inputDestroyer,true)
            }
            autoRef.current = true
        }

        const inputDestroyer = (event) => {
            event.preventDefault()
            event.stopPropagation()
        }
        
        if (autoRef.current === true){
            autoRef.current = false
            runAutoCommand(autoCommand)
        }
        
    },[autoCommand])




    return(
        <TerminalDiv>{baseText}{textSlice1}<TerminalCursor>{cursorText}</TerminalCursor>{textSlice2}</TerminalDiv>
    )
}

export default TextInput;