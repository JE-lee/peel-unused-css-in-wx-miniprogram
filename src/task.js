let fs = require('fs')
let path = require('path')
let wxmlParse = require('./parse-wxml')
let cssParse = require('./parse-css')
let chalk = require('chalk')

async function task(cssPath, wxmlPaths){
  let { invalid,  classes, cssAst, filePath } = await cssParse(cssPath)
  if(invalid) return Promise.reject(`can't parse the ${cssPath}`)
  let warns = [] 
  for(let i = 0; i < wxmlPaths.length; i++){
    let { invalid: wxmlInvalid, classNames, warn, filePath: wxmlPath} = await wxmlParse(wxmlPaths[i])
    // parse wxml fail 
    if(wxmlInvalid) continue
    warn.length && warns.push({
      filePath: wxmlPath,
      warn
    })

    classNames.forEach(clsName => {
      let indexs = []
      classes.forEach((cls, index) => {
        if(cls.className === clsName){
          indexs.push(index)
        }
      })

      // remove
      indexs.forEach(i => classes.splice(i,1))
    })
  }

  // resolve cssAst's rules
  classes.forEach(item => {
    let selectors = cssAst.stylesheet.rules[item.rulesIndex].selectors
    selectors.splice(item.selectorsIndex, 1)
  })

  cssAst.stylesheet.rules = cssAst.stylesheet.rules.filter(rule => rule.selectors.length)
  return {
    warns,
    cssAst,
    cssPath: filePath
  }
}

module.exports = task