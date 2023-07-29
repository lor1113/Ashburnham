import './App.css';
import React, { useEffect, useRef, useReducer } from 'react';
import TextDiv from './TextSpan';
import TextInput from './TextInput';
import MultiTextDiv from './MultiTextDiv';
import ListDiv from './ListDiv';
import ImageDisplay from './ImageDisplay';
import TestImg1 from './static/testimg1.jpg'

const subDirectories = {
  "~":["projects","work_experience","education"],
  "projects":["Astrodigos"],
  "work_experience":[],
  "education":[],
  "Astrodigos":[]
}

const parentDirectories = {
  "~":"~",
  "projects":"~",
  "work_experience":"~",
  "education":"~",
  "Astrodigos":"projects"
}

const subFiles = {
  "~":["CV.txt","Biography.txt", "test.txt"],
  "projects":[],
  "work_experience":[],
  "education": [],
  "Astrodigos":["Astro.txt"]
}

const openFiles = {
    "test.txt":[TestImg1,"Test Image 1.txt","Alt Text for a Test Image"]
}

const commandHelp = [
    "Standard commands:",
    "ls: Lists all files and directories within the current directory.",
    "cd: Change directory. Use '..' to enter the parent directory.",
    "open: Opens a file.",
    "clear: clears the terminal window",
    "contact: Displays contact information."
  ]

const commandFailString = "zsh: command not found: "
const cdFailString = "cd: not a directory: "
const validCommands = ["ls","cd","open","sudo","nano","vi","rm"]



const stringMatcher = (inputString,toMatch) => {
  inputString = inputString.toLowerCase()
  const stringLength = inputString.length
  const output = toMatch.find(x => x.slice(0,stringLength).toLowerCase() === inputString)
  return output
}

const inputDestroyer = (event) => {
    event.preventDefault()
    event.stopPropagation()
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const addText = (newState,textInput,multi=false) => {
    let newStringArray = []
    if (Array.isArray(textInput) && (!multi)){
        newStringArray = textInput
    } else {
        newStringArray = [textInput]
    }
    newStringArray.forEach(newString => {
        newState.listCounter += 1
        if (newState.listCounter > 1000000){
            newState.listCounter = 0
        }
        newState.terminalText.push([newState.listCounter,newString])
        if (newState.terminalText.length > 40) {
            newState.terminalText = newState.terminalText.slice(-40)
        }
    })
    return newState
}

const wipeText = (newState) => {
    newState.inputSlice1 = ""
    newState.inputSlice2 = ""
    newState.cursorText = "\u00A0"
    newState.cursorPos = 0
    return newState
}

const handleAutocomplete = (state,newState) => {
    const textCommand = state.fullText
    const commandSeparator = textCommand.indexOf(" ")
    const currentCommand = (commandSeparator === -1 ? textCommand.trim() : textCommand.slice(0,commandSeparator))
    const currentArgs = (commandSeparator === -1 ? "" : textCommand.slice(commandSeparator + 1).trim())
    let result = ""
    if (commandSeparator === -1) {
        result = stringMatcher(currentCommand,validCommands)
        if (result) {
            newState = wipeText(newState)
            newState.inputSlice1 = result
        }
    } else {
        switch (currentCommand) {
            case "open":
            case "nano":
            case "vi":
                result = stringMatcher(currentArgs,state.childFiles)
                break;
            default:
                result = stringMatcher(currentArgs,state.childDirectories)
        }
        if (result) {
            newState = wipeText(newState)
            newState.inputSlice1 = currentCommand + " " + result
        }
    }

    return newState
}

const textHandler = (state,newState,action,actionData) => {
    switch(action){
        case 'textWipe':
            newState = wipeText(newState)
            break;
        case 'addKey':
            newState.inputSlice1 = state.inputSlice1 + actionData
            break;
        case 'delete':
            newState.inputSlice1 = state.inputSlice1.slice(0,-1)
            break;
        case 'cursor':
        case 'cursorSet':
            const newCursorPos = Math.max(Math.min((action === "cursor" ? state.cursorPos + actionData : actionData),0),-state.fullText.length)
            newState.cursorPos = newCursorPos
            if (newCursorPos === 0) {
                newState.inputSlice1 = state.fullText
                newState.inputSlice2 = ""
                newState.cursorText = "\u00A0"
            } else {
                const newCursorIndex = state.fullText.length + newCursorPos
                newState.cursorText = state.fullText[newCursorIndex]
                newState.inputSlice1 = state.fullText.slice(0,newCursorIndex)
                newState.inputSlice2 = state.fullText.slice(newCursorIndex + 1)
            }
            break
        case 'upDown':
            const newCommandHistoryPos = Math.max(Math.min(state.commandHistoryPos + actionData,state.commandHistory.length-1),-1)
            if (newCommandHistoryPos !== state.commandHistoryPos) {
                if (state.commandHistoryPos === -1) {
                    newState.currentBuffer = state.fullText
                }
                if (newCommandHistoryPos === -1) {
                    newState.inputSlice1 = state.currentBuffer
                } else {
                    newState.inputSlice1 = state.commandHistory[newCommandHistoryPos]
                }
                newState.cursorPos = 0
                newState.cursorText = "\u00A0"
                newState.commandHistoryPos = newCommandHistoryPos
            }
            break;
        default:
            console.log("default case hit for textHandler")
            console.log(action)
    }
    return newState
}

const reducer = (state,dispatch) => {
    console.log(dispatch)
    let newState = structuredClone(state)
    const actionType = dispatch["type"]
    const action = dispatch["action"]
    const actionData = dispatch["data"]
    switch (actionType) {
        case "keyInput":
            newState = textHandler(state,newState,action,actionData)
            break;
        case "execute":
            newState.autoCommand = [""]
            newState = executeCommand(state,newState)
            break;
        case "autoCommand":
            newState.autoCommand = [actionData,1,true]
            if (state.showList) {
                newState.showList = false
                const newChildItems = state.childDirectories.map(x => "/"+x).concat(state.childFiles)
                addText(newState,newChildItems,true)
            }
            break;
        case "autocomplete":
            newState = handleAutocomplete(state,newState)
            break;
        case "writeBuffer":
            newState = addText(newState,newState.fullText)
            newState.autoCommand = [""]
            newState = wipeText(newState)
            break;
        case "closeImage":
            newState.displayImage = ""
            newState.cursorFlash =  true
            break;
        default:
            console.log("default case hit for reducer")
            console.log(dispatch)
    }
    newState.fullText = (newState.cursorPos === 0 ? newState.inputSlice1 : newState.inputSlice1 + newState.cursorText + newState.inputSlice2)
    return newState
}

const executeCommand = (state, newState) => {
    const textCommand = state.fullText
    newState.commandHistory.unshift(textCommand)
    if (newState.commandHistory.length > 50){
        newState.commandHistory = newState.commandHistory.slice(0,50)
    }
    newState.commandHistoryPos = -1
    newState = wipeText(newState)
    newState = addText(newState,"> " + textCommand)
    if (textCommand[0] === " "){
        return newState
    }
    const commandSeparator = textCommand.indexOf(" ")
    const currentCommand = (commandSeparator === -1 ? textCommand.trim() : textCommand.slice(0,commandSeparator))
    const currentArgs = (commandSeparator === -1 ? "" : textCommand.slice(commandSeparator + 1).trim())
    switch (currentCommand) {
        case "cd":
            if (currentArgs === ""){}
            else if (currentArgs === ".." || state.childDirectories.includes(currentArgs)){
                const newDirectory = (currentArgs === ".." ? parentDirectories[state.currentDir]: currentArgs)
                newState.currentDir = newDirectory
                newState.childDirectories = subDirectories[newDirectory]
                newState.childFiles = subFiles[newDirectory]
                let x = newDirectory
                let dirPath = ""
                while (x !== "~"){
                    dirPath = "/" + x + dirPath
                    x = parentDirectories[x]
                }
                newState.dirPath = dirPath
                newState.baseText = state.username + "~" + dirPath + " >"
            } else {
                const outString = cdFailString + currentArgs
                newState = addText(newState,outString)
            }
            break;
        case "help":
            newState = addText(newState,commandHelp)
            break;
        case "clear":
            newState.terminalText = []
            break;
        case "ls":
            newState.showList = true
            break;
        case "echo":
            newState = addText(newState,currentArgs)
            break;
        case "open":
            if (state.childFiles.includes(currentArgs)) {
                newState.cursorFlash = false
                newState.displayImage = openFiles[currentArgs]
            } else {
                const openFailString = "The file " + state.dirPath + currentArgs + " does not exist"
                newState = addText(newState,openFailString)
            }
            break;
        default:
            const outString = commandFailString + currentCommand
            newState = addText(newState,outString)
    }
    return newState
}

const initialState = () => {
  return({
        "inputSlice1":"",
        "inputSlice2":"",
        "cursorPos":0,
        "cursorText": "\u00A0",
        "fullText": "",
        "currentDir":"~",
        "childDirectories": subDirectories["~"],
        "childFiles": subFiles["~"],
        "username": "lorenzocurcio ",
        "baseText": "lorenzocurcio ~ >",
        "terminalText": [],
        "showList":false,
        "autoCommand": ["ls",1,true],
        "listCounter":0,
        "displayImage": "",
        "dirPath": "~/",
        "cursorFlash": true,
        "commandHistory":[],
        "commandHistoryPos":-1,
        "currentBuffer": ""
  })
}

function App() {
    const [state,dispatch] = useReducer(reducer,null,initialState)
    const autoRef = useRef(true)

    const handleKeyDown = (event) => {
        const isPrintableKey = event.key.length === 1 || event.key === 'Unidentified';
        let dispatchEvent = {"type":"keyInput","action":0, "data":0}
        if (isPrintableKey) {
            dispatchEvent["action"] = "addKey"
            dispatchEvent["data"] = event.key
            dispatch(dispatchEvent)
        } else {
            switch (event.keyCode) {
                case 8:
                case 46:
                    dispatchEvent["action"] = "delete"
                    dispatch(dispatchEvent)
                    break;
                case 13:
                    dispatchEvent["type"] = "execute"
                    dispatch(dispatchEvent)
                    break;
                case 37:
                case 39:
                    dispatchEvent["action"] = "cursor"
                    dispatchEvent["data"] = event.keyCode - 38
                    dispatch(dispatchEvent)
                    break;
                case 38:
                case 40:
                    dispatchEvent["action"] = "upDown"
                    dispatchEvent["data"] = 39 - event.keyCode
                    dispatch(dispatchEvent)
                    break;
                case 9:
                    dispatchEvent["type"] = "autocomplete"
                    dispatch(dispatchEvent)
                    event.preventDefault()
                    break;
                default:
                    break;
            }
        }
    }

    const handleListClick = (event,dir) => {
        const newCommand = (dir ? "cd " : "open ")
        dispatch({"type":"autoCommand","action":0, "data":newCommand + event})
    }

    useEffect(() => {
        document.body.scrollTo(0,document.body.scrollHeight)
    },[state.terminalText,state.fullText,state.cursorPos])

    useEffect(() => {
        console.log("added listener")
        document.addEventListener("keydown",handleKeyDown)
        return () => {
            console.log("removed listener")
            document.removeEventListener("keydown",handleKeyDown)
            };
    },[])

  useEffect(() => {
    async function runAutoCommand(autoCommand) {
        if (autoCommand[0]) {
            console.log("running auto command")
            document.addEventListener("keydown",inputDestroyer,true)
            dispatch({"type":"keyInput","action":"textWipe", "data":0})
            await sleep(200 * autoCommand[1])
            for (let x = 0; x < autoCommand[0].length; x++) {
                dispatch({"type":"keyInput","action":"addKey", "data":autoCommand[0][x]})
                await sleep(200 * autoCommand[1])
            }
            await sleep(300 * autoCommand[1])
            if (autoCommand[2]){
                dispatch({"type":"execute","action":"0", "data":0})
            } else {
                dispatch({"type":"writeBuffer","action":"0", "data":0})
            }
            document.removeEventListener("keydown",inputDestroyer,true)
        }   
        autoRef.current = true
        }
        
        if (autoRef.current === true){
            autoRef.current = false
            runAutoCommand(state.autoCommand)
        }
        
    },[state.autoCommand])

  const textDivs = state.terminalText.map(x => {
    if (Array.isArray(x[1])){
      return <MultiTextDiv key={x[0]} text={x[1]}/>
    } else {
      return <TextDiv key={x[0]} text={x[1]}/>
    }
  })

  return (
    <div className="mainWrapper">
        {textDivs}
        {state.showList ? <ListDiv childDirectories={state.childDirectories} childFiles={state.childFiles} handleListClick={handleListClick}/> : <></>}
        <TextInput baseText={state.baseText} inputSlice1={state.inputSlice1} cursorText={state.cursorText} inputSlice2={state.inputSlice2} cursorFlash={state.cursorFlash}/>
        <div className='bottomDiv'/>
        {state.displayImage ? <ImageDisplay image={state.displayImage} dispatch={dispatch}/> : <></>}
    </div>
  );
}

export default App;
