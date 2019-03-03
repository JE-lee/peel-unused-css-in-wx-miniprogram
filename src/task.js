let fs = require('fs')
let path = require('path')
let wxmlParse = require('./parse-wxml')
let cssParse = require('./parse-css')
let chalk = require('chalk')
let css = require('css')

async function handleCss(cssPath){
  let { invalid,  classes, cssAst, filePath } = await cssParse(cssPath)
  if(invalid) return []
  let results = [{ classes, cssAst, filePath }]
  let getImport = i => {
    let arr = i.match(/"\s*(.+)\s*"/)
    return arr ? arr[1] : ''
  }
  let relatePaths = cssAst.stylesheet.rules
                    .filter(rule => rule.type == 'import')
                    .map(rule => path.resolve(path.dirname(cssPath), getImport(rule.import)))
  for(let i = 0; i< relatePaths.length; i++){
    results = results.concat(await handleCss(relatePaths[i]))
  }

  return results
}

function rewrite(cssOb){
  cssOb.forEach(ob => {
    let cssCode = css.stringify(ob.cssAst)
    fs.writeFileSync(ob.filePath, cssCode, 'utf8')
  })
}


function printWarns(warns){
  if(!warns.length) return 
  warns.forEach(warn => {
    console.log(chalk.yellow(`warning:${warn.filePath}\n`+`  lines:${warn.lines}  expression:${warn.expression}`))
  })
}

async function task(cssPath, wxmlPaths){
  let cssResults = await handleCss(cssPath)
  if(!cssResults.length) return Promise.reject(`can't parse the ${cssPath}`)

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
      cssResults.forEach(({ classes }) => {
        classes.forEach((cls, index) => {
          if(cls.className === clsName){
            classes[index].invalid = true
          }
        })
      })
    })

    // remove 
    cssResults.forEach(({ classes }, index) => {
      // remove
      cssResults[index].classes = classes.filter(cls => !cls.invalid)
    })
  }

  // resolve cssAst's rules
  cssResults.forEach(({ classes, cssAst }) => {
    classes.forEach(item => cssAst.stylesheet.rules[item.rulesIndex].selectors[item.selectorsIndex] = '')
    cssAst.stylesheet.rules.filter(rule => rule.type == 'rule').forEach(rule => {
      rule.selectors = rule.selectors.filter(sel => sel)
    })

    cssAst.stylesheet.rules = cssAst.stylesheet.rules.filter(rule => rule.type != 'rule' || rule.selectors.length)
  })

  // rewrite css file 
  rewrite(cssResults)
  // TODO: data statistics
  console.log(chalk.green(`sucess!`))
  // print warns 
  printWarns(warns)
}

module.exports = task