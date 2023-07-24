import './App.css';
import React, { useState, useEffect } from 'react';
import TextDiv from './TextDiv';
import TextInput from './TextInput';
import MultiTextDiv from './MultiTextDiv';

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
  let terminalTextArray = startingText

  const baseChildren = subDirectories["~"].concat(subFiles["~"])

  const [terminalText, setTerminalText] = useState(terminalTextArray)
  const [workingDirectory, setWorkingDirectory] = useState("~")
  const [childDirectories, setChildDirectories] = useState(subDirectories["~"])
  const [childItems, setChildItems] = useState(baseChildren)
  const [autoCommand, setAutoCommand] = useState("help")

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
      terminalTextArray.push([listCounter,newString])
      if (terminalTextArray.length > 40) {
        terminalTextArray = terminalTextArray.slice(-40)
      }
    })
    setTerminalText([...terminalTextArray])
  }

  useEffect(() => {
    document.body.scrollTo(0,document.body.scrollHeight)
  },[terminalText])
  
  const executeCommand = (textCommand) => {
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
        const newChildren = subDirectories[newDirectory].concat(subFiles[newDirectory])
        setChildItems(newChildren)
        setChildDirectories(subDirectories[newDirectory])
        setWorkingDirectory(newDirectory)
      } else if (childDirectories.includes(currentArgs)) {
        const newChildren = subDirectories[currentArgs].concat(subFiles[currentArgs])
        setChildItems(newChildren)
        setChildDirectories(subDirectories[currentArgs])
        setWorkingDirectory(currentArgs)
      } else {
        const outString = cdFailString + currentArgs
        AddText(outString)
      }
    } else if (currentCommand === "help") {
      AddText(commandHelp)
    } else if (currentCommand === "clear") {
      setTerminalText([])
    } else {
      const outString = commandFailString + currentCommand
      AddText(outString)
    }
  }

  return (
    <div className="mainWrapper">
      {textDivs}
      <TextInput workingDirectory={workingDirectory} childItems={childItems} executeCommand={executeCommand} autoCommand={autoCommand}/>
      <div className='bottomDiv'/>
    </div>
  );
}

export default App;
