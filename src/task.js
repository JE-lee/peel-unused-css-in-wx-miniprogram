let fs = require('fs')
let path = require('path')
let wxmlParse = require('./parse-wxml')
let cssParse = require('./parse-css')
let chalk = require('chalk')
let css = require('css')
let ProgressBar = require('progress')

async function handleCss(cssPath){
  let { invalid,  classes, cssAst, filePath, originalSize } = await cssParse(cssPath)
  if(invalid) return []
  let results = [{ classes, cssAst, filePath, originalSize }]
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
  let total = 0, reduce = 0
  cssOb.forEach(ob => {
    let cssCode = css.stringify(ob.cssAst)
    total += ob.originalSize
    reduce += cssCode.length
    fs.writeFileSync(ob.filePath, cssCode, 'utf8')
  })

  console.log(chalk.green(`reduce total size: ${ ((Math.max(0, total - reduce )) / 1024).toFixed(3)} kb` ))
}


function printWarns(warns){
  if(!warns.length) return 
  warns.forEach(warn => {
    console.log(chalk.yellowBright(`warning:${warn.filePath}`))
    warn.warn.forEach(w => {
      console.log(chalk.green(`  lines:${w.lines}  expression:${w.expression}\n`))
    })
  })
}

async function task(cssPath, wxmlPaths){
  let cssResults = await handleCss(cssPath)
  if(!cssResults.length) {
    console.log(chalk.yellowBright(`can't parse the ${cssPath}`))
    return Promise.reject(`can't parse the ${cssPath}`)
  }

  let warns = [],
    bar = new ProgressBar('peeling: [:bar] :percent',{
      complete: '=',
      incomplete: ' ',
      width: 50,
      total: wxmlPaths.length
    })
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

    bar.tick()
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
  console.log(chalk.green(`sucess!`))
  // print warns 
  printWarns(warns)
}

module.exports = task