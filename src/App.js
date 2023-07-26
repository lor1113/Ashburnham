import './App.css';
import React, { useEffect, useRef, useReducer } from 'react';
import TextDiv from './TextDiv';
import TextInput from './TextInput';
import MultiTextDiv from './MultiTextDiv';
import ListDiv from './ListDiv';

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
  "~":["CV.txt","Biography.txt"],
  "projects":[],
  "work_experience":[],
  "education": [],
  "Astrodigos":["Astro.txt"]
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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const AddText = (newState,textInput,multi=false) => {
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

    newState.fullText = newState.inputSlice1 + newState.cursorText + newState.inputSlice2
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
            const fullText = (state.cursorPos === 0 ? state.inputSlice1 : state.inputSlice1 + state.cursorText + state.inputSlice2)
            const newCursorPos = Math.max(Math.min((action === "cursor" ? state.cursorPos + actionData : actionData),0),-fullText.length)
            newState.cursorPos = newCursorPos
            if (newCursorPos === 0) {
                newState.inputSlice1 = fullText
                newState.inputSlice2 = ""
                newState.cursorText = "\u00A0"
            } else {
                const newCursorIndex = fullText.length + newCursorPos
                newState.cursorText = fullText[newCursorIndex]
                newState.inputSlice1 = fullText.slice(0,newCursorIndex)
                newState.inputSlice1 = fullText.slice(newCursorIndex + 1)
            }
            break
        default:
            console.log("default case hit for textHandler")
            console.log(action)
    }
    newState.fullText = newState.inputSlice1 + newState.cursorText + newState.inputSlice2
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
            return (textHandler(state,newState,action,actionData))
        case "execute":
            return(executeCommand(state,newState))
        case "autoCommand":
            newState.autoCommand = actionData
            return newState
        case "autocomplete":
            return(handleAutocomplete(state,newState))
        default:
            console.log("default case hit for reducer")
            console.log(dispatch)
            return state
    }
}

const executeCommand = (state, newState) => {
    const textCommand = state.fullText
    newState = wipeText(newState)
    if (state.showList) {
        newState.showList = false
        const addSlash = state.childDirectories.map(x => "/"+x)
        const newChildItems = addSlash.concat(state.childFiles)
        AddText(newState,newChildItems,true)
    }
    newState = AddText(newState,"> " + textCommand)
    if (textCommand[0] === " "){
        return newState
    }
    const commandSeparator = textCommand.indexOf(" ")
    const currentCommand = (commandSeparator === -1 ? textCommand.trim() : textCommand.slice(0,commandSeparator))
    const currentArgs = (commandSeparator === -1 ? "" : textCommand.slice(commandSeparator + 1).trim())
    if (currentCommand === "cd"){
        if (currentArgs === ""){} 
        else if (currentArgs === ".." || state.childDirectories.includes(currentArgs)){
            const newDirectory = (currentArgs === ".." ? parentDirectories[state.currentDir]: currentArgs)
            newState.currentDir = newDirectory
            newState.childDirectories = subDirectories[newDirectory]
            newState.childFiles = subFiles[newDirectory]
            newState.baseText = state.username + newDirectory + " >"
        } else {
            const outString = cdFailString + currentArgs
            newState = AddText(newState,outString)
        }
    } else if (currentCommand === "help") {
        newState = AddText(newState,commandHelp)
    } else if (currentCommand === "clear") {
        newState.terminalText = []
    } else if (currentCommand === "ls") {
        newState.autoCommand = ""
        newState.showList = true
    } else {
        const outString = commandFailString + currentCommand
        newState = AddText(newState,outString)
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
      "autoCommand": "ls",
      "listCounter":0
  })
}

function App() {
    const [state,dispatch] = useReducer(reducer,null,initialState)
    const autoRef = useRef(true)

    const handleKeyDown = (event) => {
        let isPrintableKey = event.key.length === 1 || event.key === 'Unidentified';
        let dispatchEvent = {"type":"keyInput","action":0, "data":0}
        if (isPrintableKey) {
        dispatchEvent["action"] = "addKey"
        dispatchEvent["data"] = event.key
        dispatch(dispatchEvent)
        } else if (event.keyCode === 8 || event.keyCode === 46) {
        dispatchEvent["action"] = "delete"
        dispatch(dispatchEvent)
        } else if (event.keyCode === 13){
        dispatchEvent["type"] = "execute"
        dispatch(dispatchEvent)
        } else if (event.keyCode === 37) {
        dispatchEvent["action"] = "cursor"
        dispatchEvent["data"] = -1
        dispatch(dispatchEvent)
        } else if (event.keyCode === 39){
        dispatchEvent["action"] = "cursor"
        dispatchEvent["data"] = 1
        dispatch(dispatchEvent)
        } else if (event.keyCode === 9){
        dispatchEvent["type"] = "autocomplete"
        dispatch(dispatchEvent)
        event.preventDefault()
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
        if (autoCommand) {
            console.log("running auto command")
            document.addEventListener("keydown",inputDestroyer,true)
            dispatch({"type":"keyInput","action":"textWipe", "data":0})
            await sleep(200)
            for (let x = 0; x < autoCommand.length; x++) {
                dispatch({"type":"keyInput","action":"addKey", "data":autoCommand[x]})
                await sleep(200)
            }
            await sleep(300)
            dispatch({"type":"execute","action":"0", "data":0})
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
      <TextInput baseText={state.baseText} inputSlice1={state.inputSlice1} cursorText={state.cursorText} inputSlice2={state.inputSlice2}/>
      <div className='bottomDiv'/>
    </div>
  );
}

export default App;
