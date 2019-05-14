import React from 'react'
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter'
import js from 'react-syntax-highlighter/dist/cjs/languages/hljs/javascript'
import coffeeScript  from 'react-syntax-highlighter/dist/cjs/languages/hljs/coffeescript'
import python  from 'react-syntax-highlighter/dist/cjs/languages/hljs/python'
import { githubGist } from 'react-syntax-highlighter/dist/cjs/styles/hljs'
import PropTypes from 'prop-types'

SyntaxHighlighter.registerLanguage('javascript', js)
SyntaxHighlighter.registerLanguage('coffeescript', coffeeScript)
SyntaxHighlighter.registerLanguage('python', python)


const lineHighlightedStyle = {
	backgroundColor: '#fff7b0',
	display: 'block',
	width: '100%'
}

const toolbarStyle = {
	float: 'right',
	marginTop: '-10px'
}

// As taken from https://hackernoon.com/copying-text-to-clipboard-with-javascript-df4d4988697f
const copyToClipboard = str => {
	const el = document.createElement('textarea')  // Create a <textarea> element
	el.value = str                                 // Set its value to the string that you want copied
	el.setAttribute('readonly', '')                // Make it readonly to be tamper-proof
	el.style.position = 'absolute'                 
	el.style.left = '-9999px'                      // Move outside the screen to make it invisible
	document.body.appendChild(el)                  // Append the <textarea> element to the HTML document
	const selected =            
    document.getSelection().rangeCount > 0        // Check if there is any content selected previously
    	? document.getSelection().getRangeAt(0)     // Store selection if found
    	: false                                    // Mark as false to know no selection existed before
	el.select()                                    // Select the <textarea> content
	document.execCommand('copy')                   // Copy - only works as a result of a user action (e.g. click events)
	document.body.removeChild(el)                  // Remove the <textarea> element
	if (selected) {                                 // If a selection existed before copying
		document.getSelection().removeAllRanges()    // Unselect everything on the HTML document
		document.getSelection().addRange(selected)   // Restore the original selection
	}
}


const CodeSyntax = ({ children, highlightedLines, language, showLineNumbers }) => {

	const copyCodeToClipboard = () => {
		copyToClipboard(children)
	}

	//Convert highlightedLines to hash map, this way we walk through the array just once
	const newHighlightedLines = {};
	(highlightedLines || []).forEach(lineNumber => {
		newHighlightedLines[lineNumber] = 1
	})
	return (
		<div>
			<SyntaxHighlighter
				style={githubGist} 
				language={language || 'javascript'}
				showLineNumbers={showLineNumbers || 'true'}
				wrapLines='true'
				lineProps={(lineNumber) => {
					return newHighlightedLines[lineNumber] === 1 ? {style: lineHighlightedStyle} : undefined
				}
				} >
				{children}
			</SyntaxHighlighter>
			<div style={toolbarStyle}><button onClick={copyCodeToClipboard}>Copy to clipboard</button></div>
		</div>
	)}

CodeSyntax.propTypes = {
	children: PropTypes.any.isRequired,
	highlightedLines: PropTypes.array,
	language: PropTypes.string,
	showLineNumbers: PropTypes.bool,
}
  
export default CodeSyntax
