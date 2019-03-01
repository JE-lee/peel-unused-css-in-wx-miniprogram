// parse text interpolation in wxml

let jsep = require('jsep')
let namedTypes = require('ast-types').namedTypes

function parse(expression){
  try {
    return Promise.resolve(jsep(expression))
  } catch (error) {
    return Promise.reject(error)
  }
}

async function isConditionalExpression(expression){
  try {
    return namedTypes.ConditionalExpression.check(jsep(expression))
  } catch (error) {
    return false
  }
}

async function extractCss(expression){
  // not ConditionalExpression
  let parseResult,
    failResult = {
      classes: [],
      isHasValid: true
    }
    
  try {
    parseResult = await parse(expression)
  } catch (error) {
    return failResult
  }
  if (!namedTypes.ConditionalExpression.check(parseResult))
    return failResult
  debugger
  let extract = unit => {
    let data = {
      classes: [],
      isHasValid: false
    }
    let op = ex => {
      if (namedTypes.Literal.check(ex)) {
        if(ex.value.trim()) data.classes.push(ex.value.trim())
      } else if (isConditionalExpression(ex)) {
        let extractResult = extract(ex)
        data.classes = data.classes.concat(extractResult.classes)
        data.isHasValid = extractResult.isHasValid || data.isHasValid
      } else {
        debugger
        data.isHasValid = true
      }
    }
    op(unit.consequent)
    op(unit.alternate)
    return data 
  }

  return extract(parseResult)
}

module.exports = extractCss