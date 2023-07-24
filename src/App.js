import './App.css';
import React, { useState, useEffect } from 'react';
import TextDiv from './TextDiv';
import TextInput from './TextInput';

const startingText = [
  "The quick brown fox jumps aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa over the lazy dog",
  "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb lol"
]

const subDirectories = {
  "~":["projects","work_experience","education"],
  "projects":["Astrodigos"]
}

const parentDirectories = {
  "~":"~",
  "projects":"~"
}

const commandFailString = "zsh: command not found: "
const cdFailString = "cd: not a directory: "

function App() {
  let terminalTextArray = startingText

  const [terminalText, setTerminalText] = useState(terminalTextArray)
  const [workingDirectory, setWorkingDirectory] = useState("~")
  const [childDirectories, setChildDirectories] = useState(subDirectories["~"])

  const textDivs = terminalText.map(x => <TextDiv text={x}/>)

  const AddText = (newString) => {
    terminalTextArray.push(newString)
    if (terminalTextArray.length > 40) {
      terminalTextArray = terminalTextArray.slice(-25)
    }
    setTerminalText([...terminalTextArray])
  }
  
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
      currentArgs = textCommand.slice(commandSeparator + 1)
    }
    if (currentCommand === "cd"){
      if (currentArgs === ""){} else if (currentArgs === ".."){
        const newDirectory = parentDirectories[workingDirectory]
        setWorkingDirectory(newDirectory)
        setChildDirectories(subDirectories[newDirectory])
      }else if (childDirectories.includes(currentArgs)) {
        setWorkingDirectory(currentArgs)
        setChildDirectories(subDirectories[currentArgs])
      } else {
        const outString = cdFailString + currentArgs
        AddText(outString)
      }
    } else {
      const outString = commandFailString + currentCommand
      AddText(outString)
    }
  }

  return (
    <div className="mainWrapper">
      {textDivs}
      <TextInput workingDirectory={workingDirectory} childDirectories={childDirectories} executeCommand={executeCommand}/>
    </div>
  );
}

export default App;
