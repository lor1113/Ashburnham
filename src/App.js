import './App.css';
import React, { useState, useEffect, useRef } from 'react';
import TextDiv from './TextDiv';
import TextInput from './TextInput';
import MultiTextDiv from './MultiTextDiv';
import ListDiv from './ListDiv';

const startingText = []

const subDirectories = {
  "~":["projects","work_experience","education"],
  "projects":["Astrodigos"],
  "Astrodigos":[]
}

const parentDirectories = {
  "~":"~",
  "projects":"~",
  "Astrodigos":"projects"
}

const subFiles = {
  "~":["CV.txt","Biography.txt"],
  "projects":[],
  "Astrodigos":["Astro.txt"]
}

const commandFailString = "zsh: command not found: "
const cdFailString = "cd: not a directory: "

const validCommands = ["ls","cd","open","sudo","nano","vi","rm"]

const commandHelp = [
  "Standard commands:",
  "ls: Lists all files and directories within the current directory.",
  "cd: Change directory. Use '..' to enter the parent directory.",
  "open: Opens a file.",
  "clear: clears the terminal window",
  "contact: Displays contact information."
]

let listCounter = 0

function App() {
  const terminalTextArray = useRef(startingText)
  const listShown = useRef(false)

  const startChildItems = subDirectories["~"].concat(subFiles["~"])

  const [terminalText, setTerminalText] = useState(startingText)
  const [workingDirectory, setWorkingDirectory] = useState("~")
  const [childDirectories, setChildDirectories] = useState(subDirectories["~"])
  const [childFiles, setChildFiles] = useState(subFiles["~"])
  const [childItems, setChildItems] = useState(startChildItems)
  const [autoCommand, setAutoCommand] = useState("ls")
  const [showList, setShowList] = useState(false)

  const textDivs = terminalText.map(x => {
    if (Array.isArray(x[1])){
      return <MultiTextDiv key={x[0]} text={x[1]}/>
    } else {
      return <TextDiv key={x[0]} text={x[1]}/>
    }
  })

  const AddText = (textInput,multi=false) => {
    let newStringArray = []
    if (Array.isArray(textInput) && (!multi)){
      newStringArray = textInput
    } else {
      newStringArray = [textInput]
    }
    newStringArray.forEach(newString => {
      listCounter += 1
      if (listCounter > 1000000){
        listCounter = 0
      }
      terminalTextArray.current.push([listCounter,newString])
      if (terminalTextArray.current.length > 40) {
        terminalTextArray.current = terminalTextArray.current.slice(-40)
      }
    })
    setTerminalText([...terminalTextArray.current])
  }

  useEffect(() => {
    document.body.scrollTo(0,document.body.scrollHeight)
  },[terminalText])
  
  const executeCommand = (textCommand) => {
    if (listShown.current) {
      setShowList(false)
      listShown.current = false
      const addSlash = childDirectories.map(x => "/"+x)
      const newChildItems = addSlash.concat(childFiles)
      AddText(newChildItems, true)
    }
    AddText("> " + textCommand)
    if (textCommand[0] === " "){
      return null
    }
    const commandSeparator = textCommand.indexOf(" ")
    let currentCommand = ""
    let currentArgs = ""
    if (commandSeparator === -1){
      currentCommand = textCommand
      currentArgs = ""
    } else {
      currentCommand = textCommand.slice(0,commandSeparator)
      currentArgs = textCommand.slice(commandSeparator + 1).trim()
    }
    if (currentCommand === "cd"){
      if (currentArgs === ""){} else if (currentArgs === ".."){
        const newDirectory = parentDirectories[workingDirectory]
        const newChildItems = subDirectories[newDirectory].concat(subFiles[newDirectory])
        setChildFiles(subFiles[newDirectory])
        setChildDirectories(subDirectories[newDirectory])
        setChildItems(newChildItems)
        setWorkingDirectory(newDirectory)
      } else if (childDirectories.includes(currentArgs)) {
        const newChildItems = subDirectories[currentArgs].concat(subFiles[currentArgs])
        setChildFiles(subFiles[currentArgs])
        setChildDirectories(subDirectories[currentArgs])
        setChildItems(newChildItems)
        setWorkingDirectory(currentArgs)
      } else {
        const outString = cdFailString + currentArgs
        AddText(outString)
      }
    } else if (currentCommand === "help") {
      AddText(commandHelp)
    } else if (currentCommand === "clear") {
      terminalTextArray.current = []
      setTerminalText([])
    } else if (currentCommand === "autoCD") {
      setAutoCommand("blee bloo lol")
    } else if (currentCommand === "ls") {
      setAutoCommand("")
      setShowList(true)
      listShown.current = true
    } else {
      const outString = commandFailString + currentCommand
      AddText(outString)
    }
  }

  const handleListClick = (item,isDir) => {
    setShowList(false)
    listShown.current = false
    const addSlash = childDirectories.map(x => "/"+x)
    const newChildItems = addSlash.concat(childFiles)
    AddText(newChildItems, true)
    let commandText = "open "
    if (isDir) {
      commandText = "cd "
    }
    const newCommand = commandText + item
    setAutoCommand(newCommand)
  }

  return (
    <div className="mainWrapper">
      {textDivs}
      {showList ? <ListDiv childDirectories={childDirectories} childFiles={childFiles} handleListClick={handleListClick}/> : <></>}
      <TextInput workingDirectory={workingDirectory} childItems={childItems} executeCommand={executeCommand} autoCommand={autoCommand}/>
      <div className='bottomDiv'/>
    </div>
  );
}

export default App;
