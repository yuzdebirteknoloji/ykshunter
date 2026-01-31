import { MatchingData, MatchingGameState } from './types'
import { shuffle } from './utils'

export function initializeMatchingGame(
  data: MatchingData[],
  randomize: boolean = true
): MatchingGameState {
  // Her key-value çifti için benzersiz ID'ler oluştur
  let pairs = data.map((item, index) => ({
    id: `pair-${index}`,
    key: item.key,
    value: item.value
  }))

  // Randomize ise hem keys hem values'ı karıştır
  if (randomize) {
    pairs = shuffle(pairs)
  }

  return {
    mode: 'matching',
    pairs: pairs,
    userMatches: {},
    isComplete: false,
    mistakes: 0,
    startTime: Date.now()
  }
}

export function makeMatch(
  state: MatchingGameState,
  keyId: string,
  valueId: string
): MatchingGameState {
  return {
    ...state,
    userMatches: {
      ...state.userMatches,
      [keyId]: valueId
    }
  }
}

export function removeMatch(
  state: MatchingGameState,
  keyId: string
): MatchingGameState {
  const newMatches = { ...state.userMatches }
  delete newMatches[keyId]
  
  return {
    ...state,
    userMatches: newMatches
  }
}

export function checkMatchingAnswer(state: MatchingGameState): boolean {
  if (Object.keys(state.userMatches).length !== state.pairs.length) {
    return false
  }

  // Her key için doğru value'nun eşleştirilip eşleştirilmediğini kontrol et
  return state.pairs.every(pair => {
    const matchedValueId = state.userMatches[pair.id]
    // Kullanıcının seçtiği value ID'si, key'in kendi ID'si ile aynı olmalı
    return matchedValueId === pair.id
  })
}

export function submitMatchingAnswer(
  state: MatchingGameState
): MatchingGameState {
  const isCorrect = checkMatchingAnswer(state)
  
  return {
    ...state,
    isComplete: true,
    mistakes: isCorrect ? state.mistakes : state.mistakes + 1,
    endTime: Date.now()
  }
}
