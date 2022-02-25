import Head from 'next/head'
import {useState} from 'react'
import RICIBs from 'react-individual-character-input-boxes'
import styles from '../styles/Home.module.css'
import shared from '../data/words'

const allWords = shared.allWords

export default function Home() {
  const [guesses, setGuesses] = useState([])
  const [filteredWords, setFilteredWords] = useState([])

  let currentGuess = '' // fixme: make this part of state

  function handleGuessInput(guess) {
    currentGuess = guess
  }

  function handleSubmit() {
    const tempArray = Array.from(guesses || [])
    tempArray.push({word: currentGuess, score: [0, 0, 0, 0, 0]})
    setGuesses(tempArray)
  }

  function handleDeleteGuess(guessIndex) {
    guesses.splice(guessIndex, 1)
    setGuesses(Array.from(guesses))
    performFiltering()
  }

  function handleCharClick(guessIndex, charIndex) {
    // apply requirement
    const guess = guesses[guessIndex]
    if (guess.score[charIndex] == 0) {
      guess.score[charIndex] = 1
    } else if (guess.score[charIndex] == 1) {
      guess.score[charIndex] = 2
    } else if (guess.score[charIndex] == 2) {
      guess.score[charIndex] = 0
    }
    const tempArray = Array.from(guesses)
    tempArray[guessIndex] = guess
    setGuesses(tempArray)

    performFiltering()
  }

  // filter words based on current requirements
  function performFiltering() {
    let filtered = Array.from(allWords)
    if (guesses.length > 0) {
      guesses.forEach((guess) => {
        filtered = filterWords(filtered, guess)
      })
      setFilteredWords(Array.from(filtered))
    } else {
      setFilteredWords([])
    }
  }

  function filterWords(words, guess) {
    const guessedWord = guess.word // e.g. bzlnd --> blond
    const score = guess.score // e.g. [2, 0, 1, 2, 2]
    words = words.filter((word) => {
      for (let i = 0; i < score.length; i++) {
        // discard if required char isn't at correct index
        if (score[i] == 2 && word[i] !== guessedWord[i]) {
          return false
        }

        // discard if required char isn't at other index
        if (score[i] == 1 && (word[i] == guessedWord[i] || !word.includes(guessedWord[i]))) {
          return false
        }

        // discard if char isn't member
        if (score[i] == 0 && word.includes(guessedWord[i])) {
          return false
        }
      }
      // word is a keeper if we make it this far
      return true
    })
    return words
  }

  function getButtonColor(score) {
    if (score == 0) return styles.notMember
    if (score == 1) return styles.member
    return styles.correct
  }

  // render the current state of affairs
  function renderCurrentState() {
    return guesses.map((guess, guessIndex) => {
      const word = guess.word
      const score = guess.score
      const deleteGuess = () => {
        handleDeleteGuess(guessIndex)
      }

      return (
        <div className={styles.grid} key={guessIndex}>
          {word.split('').map((char, charIndex) => {
            const key = `${char}${charIndex}`
            const toggleChar = () => {
              handleCharClick(guessIndex, charIndex)
            }

            // button color based on score
            const classes = `${getButtonColor(guesses[guessIndex].score[charIndex])} ${
              styles.card
            } `
            return (
              <button className={classes} onClick={toggleChar} key={key}>
                {char}
              </button>
            )
          })}
          <img className={styles.trashcan} src="../trash.png" onClick={deleteGuess} />
        </div>
      )
    })
  }

  function renderGuessInput() {
    // fixme: force blank values on each render
    return (
      <div className={styles.guess} key={String(Date.now())}>
        <form onSubmit={handleSubmit}>
          <RICIBs
            amount={5}
            autoFocus
            handleOutputString={handleGuessInput}
            inputProps={[]}
            inputRegExp={/^[a-z]$/}
          />
          <button type="submit" onClick={handleSubmit}>
            Enter
          </button>
        </form>
      </div>
    )
  }

  // ouput available words
  function renderAvailableWords() {
    return (
      <div className={styles.result}>
        {filteredWords.length == 0 && <h3>Zero matches :/</h3>}
        {filteredWords.length == 1 && <h3>One match</h3>}
        {filteredWords.length > 1 && <h3>{filteredWords.length} words match</h3>}
        <div>{filteredWords.join(', ')}</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Wordle Solver</title>
        <meta name="description" content="Solves your Wordle so you don't have to" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Wordle Solver</h1>
        <div className={styles.description}>
          Enter your attempts, click guessed letters to change requirements
        </div>

        <div>{renderCurrentState()}</div>
        <div>{renderGuessInput()}</div>
        <div>{renderAvailableWords()}</div>
      </main>

      <footer className={styles.footer}>
        <code className={styles.code}>
          <a href="https://github.com/thomax/wordle-filter">thomax left this on github</a>
        </code>
      </footer>
    </div>
  )
}
