import { useState, useEffect } from 'react'
import './App.css'
import "prismjs/themes/prism-tomorrow.css"
import prism from "prismjs"
import Editor from "react-simple-code-editor"
import axios from 'axios'
import { use } from 'react'
import markDown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'



function App() {
  const [review, setReview] = useState(``)
  const [code, setCode] = useState(`function example(){
    return 1 + 1
  }
  `)
  useEffect(() =>{
    prism.highlightAll();
  })

  async function reviewCode(){
    const response = await axios.post('http://localhost:3000/ai/getReview', { code })

    setReview(response.data); 
  }


  return (
    <>
      <main>
        <div className="left">
          <div className="code">
            <Editor
              value={code}
              onValueChange={code => setCode(code)}
              highlight={code => prism.highlight(code, prism.languages.javascript, 'javascript')}
              padding={10}
              style={{
                fontFamily: '"Fira code", "Fira Mono", monospace',
                fontSize: 12,
                border: '1px solid #ccc',
                borderRadius: '0.7rem',
                overflow: 'auto',
                height: '100%',
                width: '100%',
                margin: 0
              }}
            />
          </div>
          <div onClick={reviewCode} className="review-button">Review</div>
        </div>
        <div className="right">
          <markDown remarkGfm>{review}</markDown>
        </div>
      </main>
    </>
  )
}


export default App
