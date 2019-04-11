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

function isConditionalExpression(expression){
  return namedTypes.ConditionalExpression.check(expression)
}

function isLogicalExpression(expression){
  return namedTypes.LogicalExpression.check(expression)
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
  if (!isConditionalExpression(parseResult) && !isLogicalExpression(parseResult))
    return failResult
  
  let extract = unit => {
    let data = {
      classes: [],
      isHasValid: false
    }
    let op = ex => {
      if (namedTypes.Literal.check(ex)) {
        data.classes.push(ex.value.trim())
      } else if (isConditionalExpression(ex) || isLogicalExpression(ex)) {
        let extractResult = extract(ex)
        data.classes = data.classes.concat(extractResult.classes)
        data.isHasValid = extractResult.isHasValid || data.isHasValid
      } else if (namedTypes.BinaryExpression.check(ex)){
        // 
      }else{
        data.isHasValid = true
      }
    }

    if(isConditionalExpression(unit)){
      op(unit.consequent)
      op(unit.alternate)
    }else if(isLogicalExpression(unit)){
      op(unit.left)
      op(unit.right)
    }
    return data 
  }

  return extract(parseResult)
}

module.exports = extractCss